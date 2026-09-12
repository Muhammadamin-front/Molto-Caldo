import "server-only";
import { desc, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { AdminSession } from "@/lib/auth";

export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Holat nomlari — admin panel faqat o'zbek tilida. */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Yangi",
  confirmed: "Tasdiqlangan",
  shipped: "Yo'lda",
  delivered: "Yetkazilgan",
  cancelled: "Bekor qilingan",
};

export interface AdminOrderItem {
  productName: string;
  productSlug: string;
  size: string;
  colorName: string;
  unitPrice: number;
  quantity: number;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  note: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  locale: string;
  createdAt: Date;
  items: AdminOrderItem[];
}

/**
 * Parolni tekshiradi. Email topilmasa ham bcrypt ishlatiladi — javob vaqti
 * bir xil qolsin, aks holda qaysi email ro'yxatda borligini payqash mumkin.
 */
const DUMMY_HASH = "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";

export async function verifyAdmin(
  email: string,
  password: string,
): Promise<AdminSession | null> {
  if (!process.env.DATABASE_URL) return null;

  const { db, schema } = await import("@/db");
  const admin = await db.query.adminUsers.findFirst({
    where: eq(schema.adminUsers.email, email.toLowerCase()),
  });

  const matches = await bcrypt.compare(
    password,
    admin?.passwordHash ?? DUMMY_HASH,
  );
  if (!admin || !matches) return null;

  return { id: admin.id, email: admin.email };
}

export async function listOrders(limit = 100): Promise<AdminOrder[]> {
  if (!process.env.DATABASE_URL) return [];

  const { db, schema } = await import("@/db");
  const rows = await db.query.orders.findMany({
    with: { items: true },
    orderBy: desc(schema.orders.createdAt),
    limit,
  });

  return rows.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    phone: o.phone,
    city: o.city,
    address: o.address,
    note: o.note,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    locale: o.locale,
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      productName: i.productName,
      productSlug: i.productSlug,
      size: i.size,
      colorName: i.colorName,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })),
  }));
}

export async function setOrderStatus(orderId: number, status: OrderStatus) {
  if (!process.env.DATABASE_URL) return;

  const { db, schema } = await import("@/db");
  await db
    .update(schema.orders)
    .set({ status })
    .where(eq(schema.orders.id, orderId));
}

export async function countNewOrders() {
  if (!process.env.DATABASE_URL) return 0;
  const { db, schema } = await import("@/db");
  const rows = await db
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(eq(schema.orders.status, "new"));
  return rows.length;
}
