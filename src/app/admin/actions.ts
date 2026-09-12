"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ORDER_STATUSES,
  setOrderStatus,
  verifyAdmin,
  type OrderStatus,
} from "@/lib/admin";
import { adminReady, createSession, destroySession, getSession } from "@/lib/auth";

export interface LoginState {
  error?: "invalid" | "not_configured" | "bad_input";
}

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

  const admin = await verifyAdmin(parsed.data.email, parsed.data.password);
  if (!admin) return { error: "invalid" };

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
