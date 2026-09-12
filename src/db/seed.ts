/**
 * Namuna katalogini Postgresga yozadi.
 *   npm run db:push   — jadvallarni yaratadi
 *   npm run db:seed   — mahsulotlarni to'ldiradi
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db, schema } from "./index";
import { sampleCategories, sampleProducts } from "./sample-data";

async function main() {
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

  // Boshlang'ich admin. Parolni birinchi kirishdan keyin almashtiring.
  const email = process.env.ADMIN_EMAIL ?? "admin@moltocaldo.uz";
  const password = process.env.ADMIN_PASSWORD ?? "moltocaldo";
  await db
    .insert(schema.adminUsers)
    .values({ email, passwordHash: await bcrypt.hash(password, 10) })
    .onConflictDoNothing();

  console.log(
    `Done: ${sampleCategories.length} categories, ${sampleProducts.length} products.`,
  );
  console.log(`Admin: ${email} / ${password}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
