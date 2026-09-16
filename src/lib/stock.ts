import "server-only";
import { and, eq, gte, lt, sql } from "drizzle-orm";

/**
 * Buyurtma zaxirani band qiladi (`createOrder`). Bu fayl uni qaytarish
 * yo'llari:
 *   - admin buyurtmani bekor qilsa — zaxira qaytadi;
 *   - bekor qilingan buyurtma qayta tiklansa — zaxira yana band qilinadi
 *     (yetmasa, holat o'zgarmaydi);
 *   - "new" holatida `ORDER_HOLD_HOURS` soatdan ortiq turgan buyurtma avtomatik
 *     bekor bo'ladi. To'lov yo'q (naqd), ya'ni soxta buyurtma berish tekin —
 *     busiz kimdir omborni sekin-asta "band qilib" tugatishi mumkin edi.
 */

export class StockUnavailableError extends Error {
  constructor(readonly variantIds: number[]) {
    super("stock_unavailable");
    this.name = "StockUnavailableError";
  }
}

/** Standart 72 soat. `ORDER_HOLD_HOURS=0` avtomatik bekor qilishni o'chiradi. */
export function holdHours() {
  const raw = process.env.ORDER_HOLD_HOURS;
  if (raw === undefined || raw.trim() === "") return 72;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

type Db = Awaited<typeof import("@/db")>["db"];
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Schema = Awaited<typeof import("@/db")>["schema"];

async function orderLines(tx: Tx, schema: Schema, orderId: number) {
  return tx
    .select({
      variantId: schema.orderItems.variantId,
      quantity: schema.orderItems.quantity,
    })
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, orderId));
}

/** Buyurtma qatorlaridagi miqdorni omborga qaytaradi. */
export async function restoreStock(tx: Tx, schema: Schema, orderId: number) {
  for (const line of await orderLines(tx, schema, orderId)) {
    // Variant keyinchalik o'chirilgan bo'lsa qaytaradigan joy yo'q.
    if (line.variantId === null) continue;
    await tx
      .update(schema.productVariants)
      .set({ stock: sql`${schema.productVariants.stock} + ${line.quantity}` })
      .where(eq(schema.productVariants.id, line.variantId));
  }
}

/** Buyurtma qatorlarini qayta band qiladi; bittasi yetmasa xato — tranzaksiya bekor. */
export async function reserveStock(tx: Tx, schema: Schema, orderId: number) {
  const short: number[] = [];
  for (const line of await orderLines(tx, schema, orderId)) {
    if (line.variantId === null) continue;
    const updated = await tx
      .update(schema.productVariants)
      .set({ stock: sql`${schema.productVariants.stock} - ${line.quantity}` })
      .where(
        and(
          eq(schema.productVariants.id, line.variantId),
          gte(schema.productVariants.stock, line.quantity),
        ),
      )
      .returning({ id: schema.productVariants.id });
    if (updated.length === 0) short.push(line.variantId);
  }
  if (short.length > 0) throw new StockUnavailableError(short);
}

// Har bir buyurtmada bazaga qo'shimcha so'rov yubormaslik uchun: bitta instans
// eski buyurtmalarni ko'pi bilan 5 daqiqada bir marta tekshiradi.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = 0;

/**
 * Muddati o'tgan "new" buyurtmalarni bekor qilib zaxirasini qaytaradi.
 * `UPDATE ... WHERE status = 'new' RETURNING` qatorlarni atomar "egallaydi":
 * ikki instans bir vaqtda ishga tushsa ham har bir buyurtma bir marta qaytadi.
 */
export async function releaseStaleOrders({ force = false } = {}): Promise<number> {
  const hours = holdHours();
  if (!process.env.DATABASE_URL || hours === 0) return 0;
  if (!force && Date.now() - lastSweep < SWEEP_INTERVAL_MS) return 0;
  lastSweep = Date.now();

  const { db, schema } = await import("@/db");
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const marker = `[Avto-bekor: ${hours} soat ichida tasdiqlanmadi]`;

  return db.transaction(async (tx) => {
    const released = await tx
      .update(schema.orders)
      .set({
        status: "cancelled",
        note: sql`trim(${schema.orders.note} || ' ' || ${marker})`,
      })
      .where(and(eq(schema.orders.status, "new"), lt(schema.orders.createdAt, cutoff)))
      .returning({ id: schema.orders.id });

    for (const order of released) {
      await restoreStock(tx, schema, order.id);
    }
    return released.length;
  });
}
