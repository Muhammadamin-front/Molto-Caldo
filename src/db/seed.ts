/**
 * Namuna katalogini Postgresga yozadi.
 *   npm run db:push   — jadvallarni yaratadi
 *   npm run db:seed   — mahsulotlarni to'ldiradi
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db, schema } from "./index";
import { sampleCategories, sampleProducts } from "./sample-data";

const MIN_PASSWORD_LENGTH = 12;

async function main() {
  // Hech narsani o'chirishdan OLDIN tekshiramiz — yarim yo'lda to'xtab qolmasin.
  //
  // Ilgari `ADMIN_PASSWORD` bo'lmasa "moltocaldo" ishlatilardi. Repo ochiq,
  // ya'ni bu parol internetda turgan edi: prod bazada seed shunday ishga
  // tushsa, har kim panelga kirib mijozlarning telefon va manzillarini ko'rardi.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `ADMIN_EMAIL va kamida ${MIN_PASSWORD_LENGTH} belgili ADMIN_PASSWORD kerak.\n` +
        `  ADMIN_EMAIL="siz@domen.uz" ADMIN_PASSWORD="..." npm run db:seed`,
    );
    process.exit(1);
  }

  // Seed katalogni va BARCHA buyurtmalarni o'chirib qayta yozadi. Ishga
  // tushgan do'konda bu haqiqiy buyurtmalarni yo'q qiladi — ataylab so'ralmasa
  // ishlamaydi.
  const [{ n: existingOrders }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.orders);
  if (existingOrders > 0 && process.env.SEED_FORCE !== "1") {
    console.error(
      `Bazada ${existingOrders} ta buyurtma bor — seed ularni o'chirib yuboradi.\n` +
        `Rostdan shuni xohlasangiz: SEED_FORCE=1 npm run db:seed`,
    );
    process.exit(1);
  }

  console.log("Seeding...");

  // Takror ishga tushirishda dublikat bo'lmasligi uchun tozalaymiz.
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.productVariants);
  await db.delete(schema.products);
  await db.delete(schema.categories);

  const categoryIdBySlug = new Map<string, number>();

  for (const c of sampleCategories) {
    const [row] = await db
      .insert(schema.categories)
      .values({
        slug: c.slug,
        nameUz: c.nameUz,
        nameRu: c.nameRu,
        nameEn: c.nameEn,
        sortOrder: c.sortOrder,
      })
      .returning({ id: schema.categories.id });
    categoryIdBySlug.set(c.slug, row.id);
  }

  for (const p of sampleProducts) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) throw new Error(`Unknown category: ${p.categorySlug}`);

    const [row] = await db
      .insert(schema.products)
      .values({
        slug: p.slug,
        categoryId,
        nameUz: p.nameUz,
        nameRu: p.nameRu,
        nameEn: p.nameEn,
        descriptionUz: p.descriptionUz,
        descriptionRu: p.descriptionRu,
        descriptionEn: p.descriptionEn,
        materialUz: p.materialUz,
        materialRu: p.materialRu,
        materialEn: p.materialEn,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        isFeatured: p.isFeatured,
        isActive: p.isActive,
      })
      .returning({ id: schema.products.id });

    await db.insert(schema.productVariants).values(
      p.variants.map((v) => ({
        productId: row.id,
        size: v.size,
        colorName: v.colorName,
        colorHex: v.colorHex,
        sku: v.sku,
        stock: v.stock,
      })),
    );
  }

  // Boshlang'ich admin. Mavjud bo'lsa paroli o'zgartirilmaydi.
  await db
    .insert(schema.adminUsers)
    .values({ email, passwordHash: await bcrypt.hash(password, 10) })
    .onConflictDoNothing();

  console.log(
    `Done: ${sampleCategories.length} categories, ${sampleProducts.length} products.`,
  );
  // Parol terminal tarixiga va CI loglariga tushmasin.
  console.log(`Admin: ${email}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
