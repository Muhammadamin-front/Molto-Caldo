import "server-only";
import { z } from "zod";
import { and, eq, gte, sql } from "drizzle-orm";
import { isValidUzPhone, normalizePhone, orderNumber } from "@/lib/utils";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { getVariantsById, type PricedVariant } from "@/lib/catalog";

/**
 * Klient faqat "nima" va "nechta" deb aytadi. Nom va narx serverda
 * katalogdan olinadi — brauzerdan kelgan summaga ishonib bo'lmaydi.
 */
export const orderLineSchema = z.object({
  variantId: z.number().int().positive(),
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

export type OrderErrorCode =
  | "duplicate_line"
  | "unknown_variant"
  | "out_of_stock";

/** Buyurtmani qabul qilib bo'lmadi — sabab `code` da, aybdor qatorlar `variantIds` da. */
export class OrderError extends Error {
  constructor(
    readonly code: OrderErrorCode,
    readonly variantIds: number[] = [],
  ) {
    super(code);
    this.name = "OrderError";
  }
}

interface PricedLine extends PricedVariant {
  quantity: number;
}

/**
 * Jami har doim serverdagi narxlardan hisoblanadi.
 */
export function computeTotals(lines: { unitPrice: number; quantity: number }[]) {
  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}

/**
 * Savat qatorlarini katalogdagi haqiqiy narx va zaxira bilan to'ldiradi.
 * Topilmagan variant yoki zaxiradan ortiq miqdor — xato.
 */
async function priceLines(input: OrderInput): Promise<PricedLine[]> {
  const ids = input.lines.map((l) => l.variantId);
  if (new Set(ids).size !== ids.length) {
    throw new OrderError("duplicate_line");
  }

  const found = await getVariantsById(input.locale, ids);
  const byId = new Map(found.map((v) => [v.variantId, v]));

  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    throw new OrderError("unknown_variant", missing);
  }

  const priced = input.lines.map((l) => ({
    ...(byId.get(l.variantId) as PricedVariant),
    quantity: l.quantity,
  }));

  const short = priced.filter((l) => l.quantity > l.stock);
  if (short.length > 0) {
    throw new OrderError(
      "out_of_stock",
      short.map((l) => l.variantId),
    );
  }

  return priced;
}

export async function createOrder(input: OrderInput) {
  const lines = await priceLines(input);
  const { subtotal, deliveryFee, total } = computeTotals(lines);
  const number = orderNumber();
  const phone = normalizePhone(input.phone);

  if (!process.env.DATABASE_URL) {
    // Demo rejimi: baza ulanmagan, buyurtma saqlanmaydi va zaxira kamaymaydi.
    return { orderNumber: number, total, persisted: false };
  }

  const { db, schema } = await import("@/db");

  await db.transaction(async (tx) => {
    // Zaxirani shart bilan kamaytiramiz: `stock >= quantity` bo'lmasa hech
    // qanday qator qaytmaydi va butun tranzaksiya bekor qilinadi. Shu bilan
    // oxirgi dona ikki xaridorga sotilib ketmaydi.
    for (const line of lines) {
      const updated = await tx
        .update(schema.productVariants)
        .set({
          stock: sql`${schema.productVariants.stock} - ${line.quantity}`,
        })
        .where(
          and(
            eq(schema.productVariants.id, line.variantId),
            gte(schema.productVariants.stock, line.quantity),
          ),
        )
        .returning({ id: schema.productVariants.id });

      if (updated.length === 0) {
        throw new OrderError("out_of_stock", [line.variantId]);
      }
    }

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
      lines.map((l) => ({
        orderId: order.id,
        variantId: l.variantId,
        productName: l.productName,
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
