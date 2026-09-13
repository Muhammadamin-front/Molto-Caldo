"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  changeAdminPassword,
  MIN_PASSWORD_LENGTH,
  ORDER_STATUSES,
  setOrderStatus,
  verifyAdmin,
  type OrderStatus,
} from "@/lib/admin";
import { peek, record, reset } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";
import { adminReady, createSession, destroySession, getSession } from "@/lib/auth";

export interface LoginState {
  error?: "invalid" | "not_configured" | "bad_input" | "rate_limited";
  /** Rad etilganda: necha daqiqadan keyin qayta urinish mumkin. */
  retryMinutes?: number;
}

// Xato urinishlar limiti. IP bo'yicha kengroq (bitta ofisdan bir necha odam),
// email bo'yicha torroq — bitta hisobni parol terib ochishni to'xtatadi.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_PER_IP = 10;
const LOGIN_MAX_PER_EMAIL = 5;

const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ready = adminReady();
  if (!ready.database || !ready.secret) return { error: "not_configured" };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "bad_input" };

  const email = parsed.data.email.toLowerCase();
  const ipKey = `login:ip:${clientIp(await headers())}`;
  const emailKey = `login:email:${email}`;

  // Limit parolni tekshirishdan OLDIN — aks holda bloklangan tajovuzkor ham
  // har urinishda bcrypt'ni ishlatib serverni band qila olardi.
  const [byIp, byEmail] = await Promise.all([
    peek(ipKey, LOGIN_MAX_PER_IP, LOGIN_WINDOW_MS),
    peek(emailKey, LOGIN_MAX_PER_EMAIL, LOGIN_WINDOW_MS),
  ]);
  if (!byIp.allowed || !byEmail.allowed) {
    const seconds = Math.max(byIp.retryAfter, byEmail.retryAfter);
    return { error: "rate_limited", retryMinutes: Math.max(1, Math.ceil(seconds / 60)) };
  }

  const admin = await verifyAdmin(email, parsed.data.password);
  if (!admin) {
    await Promise.all([record(ipKey), record(emailKey)]);
    return { error: "invalid" };
  }

  // Muvaffaqiyatli kirish shu hisobning xato urinishlarini tozalaydi.
  await reset(emailKey);
  await createSession(admin);
  // `redirect` xato tashlab ishlaydi, shuning uchun try/catch ichida emas.
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

const statusSchema = z.object({
  orderId: z.coerce.number().int().positive(),
  status: z.enum(ORDER_STATUSES),
});

export async function changeStatus(formData: FormData) {
  // Server action'ni tashqaridan ham chaqirish mumkin, shuning uchun
  // ruxsat har chaqiruvda qaytadan tekshiriladi.
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const parsed = statusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await setOrderStatus(parsed.data.orderId, parsed.data.status as OrderStatus);
  revalidatePath("/admin");
}

export interface PasswordState {
  status?: "ok" | "wrong_current" | "too_short" | "mismatch" | "rate_limited" | "error";
}

const passwordSchema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().max(200),
  confirm: z.string().max(200),
});

export async function changePassword(
  _previous: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { status: "error" };
  if (parsed.data.next.length < MIN_PASSWORD_LENGTH) return { status: "too_short" };
  if (parsed.data.next !== parsed.data.confirm) return { status: "mismatch" };

  // Sessiya o'g'irlangan bo'lsa, joriy parolni terib topishga yo'l qo'ymaymiz.
  const key = `password:admin:${session.id}`;
  const limit = await peek(key, 5, LOGIN_WINDOW_MS);
  if (!limit.allowed) return { status: "rate_limited" };

  const result = await changeAdminPassword(session.id, parsed.data.current, parsed.data.next);
  if (result === "wrong_current") {
    await record(key);
    return { status: "wrong_current" };
  }
  if (result !== "ok") return { status: result === "too_short" ? "too_short" : "error" };

  // Parol almashishi bilan boshqa barcha sessiyalar yaroqsiz bo'ldi; shu
  // brauzerni chiqarib yubormaslik uchun yangi sessiya beramiz.
  await reset(key);
  await createSession(session);
  return { status: "ok" };
}
