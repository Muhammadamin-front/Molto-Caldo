import "server-only";
import { and, eq, gt, lt, sql } from "drizzle-orm";

/**
 * Oddiy "oynali" limit: `windowMs` ichida `limit` tadan ortiq urinish bo'lsa
 * rad etiladi.
 *
 * Baza ulangan bo'lsa hisob bazada — serverless'da har bir instansning o'z
 * xotirasi bor, xotiradagi hisoblagich esa instanslar orasida bo'linmaydi va
 * limitni osongina chetlab o'tib bo'lardi. Baza bo'lmasa (demo rejimi) xotira.
 *
 * Qat'iy emas: bir vaqtda kelgan ikki so'rov ikkalasi ham sanab o'tishi
 * mumkin. Suiiste'molni to'xtatish uchun bu yetarli, aniq kvota uchun emas.
 */

export interface LimitResult {
  allowed: boolean;
  /** Qancha soniyadan keyin qayta urinish mumkin (rad etilganda). */
  retryAfter: number;
}

const memory = new Map<string, number[]>();

function memoryCheck(key: string, limit: number, windowMs: number, record: boolean): LimitResult {
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => t > now - windowMs);
  if (hits.length >= limit) {
    return { allowed: false, retryAfter: Math.ceil((hits[0] + windowMs - now) / 1000) };
  }
  if (record) hits.push(now);
  memory.set(key, hits);
  return { allowed: true, retryAfter: 0 };
}

async function count(key: string, windowMs: number) {
  const { db, schema } = await import("@/db");
  const since = new Date(Date.now() - windowMs);
  const [row] = await db
    .select({
      n: sql<number>`count(*)::int`,
      oldest: sql<Date | null>`min(${schema.rateLimitHits.createdAt})`,
    })
    .from(schema.rateLimitHits)
    .where(and(eq(schema.rateLimitHits.key, key), gt(schema.rateLimitHits.createdAt, since)));
  return { n: row?.n ?? 0, oldest: row?.oldest ? new Date(row.oldest) : null };
}

/** Limitni tekshiradi, lekin urinishni yozmaydi (masalan: faqat xato login sanaladi). */
export async function peek(key: string, limit: number, windowMs: number): Promise<LimitResult> {
  if (!process.env.DATABASE_URL) return memoryCheck(key, limit, windowMs, false);

  const { n, oldest } = await count(key, windowMs);
  if (n < limit) return { allowed: true, retryAfter: 0 };
  const retryAfter = oldest
    ? Math.max(1, Math.ceil((oldest.getTime() + windowMs - Date.now()) / 1000))
    : Math.ceil(windowMs / 1000);
  return { allowed: false, retryAfter };
}

/** Urinishni yozadi. */
export async function record(key: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    const hits = memory.get(key) ?? [];
    hits.push(Date.now());
    memory.set(key, hits);
    return;
  }

  const { db, schema } = await import("@/db");
  await db.insert(schema.rateLimitHits).values({ key });

  // Jadval cheksiz o'smasin: taxminan har 50-yozuvda bir kundan eski qatorlar tozalanadi.
  if (Math.random() < 0.02) {
    await db
      .delete(schema.rateLimitHits)
      .where(lt(schema.rateLimitHits.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
  }
}

/** Tekshiradi va ruxsat bo'lsa darhol yozadi — har bir urinish sanaladigan joylar uchun. */
export async function consume(key: string, limit: number, windowMs: number): Promise<LimitResult> {
  const result = await peek(key, limit, windowMs);
  if (result.allowed) await record(key);
  return result;
}

/** Muvaffaqiyatli kirishdan keyin shu kalit bo'yicha xatolar hisobini tozalaydi. */
export async function reset(key: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    memory.delete(key);
    return;
  }
  const { db, schema } = await import("@/db");
  await db.delete(schema.rateLimitHits).where(eq(schema.rateLimitHits.key, key));
}
