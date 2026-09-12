import "server-only";
import { z } from "zod";
import { isValidUzPhone, normalizePhone, orderNumber } from "@/lib/utils";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

export const orderLineSchema = z.object({
  variantId: z.number().int().positive(),
  productSlug: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  size: z.string().min(1).max(20),
  colorName: z.string().min(1).max(60),
  unitPrice: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(20),
});

export const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().refine(isValidUzPhone, "invalid_phone"),
  city: z.string().trim().min(2).max(120),
  address: z.string().trim().min(4).max(400),
  note: z.string().trim().max(1000).default(""),
  paymentMethod: z.enum(["click", "payme", "cash"]),
  locale: z.enum(["uz", "ru", "en"]).default("uz"),
  lines: z.array(orderLineSchema).min(1).max(50),
});

export type OrderInput = z.infer<typeof orderSchema>;

/**
 * Jamini har doim serverda qayta hisoblaymiz — klient yuborgan summaga
 * ishonib bo'lmaydi.
 */
export function computeTotals(lines: OrderInput["lines"]) {
  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

export async function createOrder(input: OrderInput) {
  const { subtotal, deliveryFee, total } = computeTotals(input.lines);
  const number = orderNumber();
  const phone = normalizePhone(input.phone);

  if (!process.env.DATABASE_URL) {
    // Demo rejimi: baza ulanmagan, buyurtma saqlanmaydi.
    return { orderNumber: number, total, persisted: false };
  }

  const { db, schema } = await import("@/db");

  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(schema.orders)
      .values({
        orderNumber: number,
        customerName: input.customerName,
        phone,
        city: input.city,
        address: input.address,
        note: input.note,
        subtotal,
        deliveryFee,
        total,
        paymentMethod: input.paymentMethod,
        // Naqd to'lovda pul yetkazilganda olinadi, shuning uchun kutilmoqda.
        paymentStatus: "pending",
        locale: input.locale,
      })
      .returning({ id: schema.orders.id });

    await tx.insert(schema.orderItems).values(
      input.lines.map((l) => ({
        orderId: order.id,
        variantId: l.variantId,
        productName: l.name,
        productSlug: l.productSlug,
        size: l.size,
        colorName: l.colorName,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
      })),
    );
  });

  return { orderNumber: number, total, persisted: true };
}
