import "server-only";
import { eq, asc, desc, and, or, ilike, inArray } from "drizzle-orm";
import type { Locale } from "@/i18n/routing";
import { sampleCategories, sampleProducts } from "@/db/sample-data";

/* -------------------------------------------------------------- turlar */

export interface Variant {
  id: number;
  size: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stock: number;
}

export interface Product {
  id: number;
  slug: string;
  categorySlug: string;
  name: string;
  description: string;
  material: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  isFeatured: boolean;
  variants: Variant[];
}

export interface Category {
  id: number;
  slug: string;
  name: string;
}

export type SortKey = "new" | "price-asc" | "price-desc";

const hasDatabase = Boolean(process.env.DATABASE_URL);

function suffix(locale: Locale) {
  return locale === "ru" ? "Ru" : locale === "en" ? "En" : "Uz";
}

const MAX_QUERY = 80;

/**
 * Qidiruv matnini tayyorlaydi. `%` va `_` — SQL `ilike` uchun maxsus
 * belgilar, xaridor ularni yozsa oddiy harf sifatida qaralishi kerak.
 */
function normalizeQuery(input: string | undefined) {
  const trimmed = (input ?? "").trim().slice(0, MAX_QUERY);
  return trimmed.length < 2 ? "" : trimmed;
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

function matchesQuery(product: Product, query: string) {
  const needle = query.toLocaleLowerCase();
  return (
    product.name.toLocaleLowerCase().includes(needle) ||
    product.description.toLocaleLowerCase().includes(needle)
  );
}

/* ---------------------------------------------- namuna ma'lumot yo'nalishi */

function sampleToProduct(
  p: (typeof sampleProducts)[number],
  locale: Locale,
): Product {
  const s = suffix(locale);
  return {
    id: p.id,
    slug: p.slug,
    categorySlug: p.categorySlug,
    name: p[`name${s}` as "nameUz"],
    description: p[`description${s}` as "descriptionUz"],
    material: p[`material${s}` as "materialUz"],
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    isFeatured: p.isFeatured,
    variants: p.variants,
  };
}

function sortProducts(list: Product[], sort: SortKey) {
  const out = [...list];
  if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
  else out.sort((a, b) => b.id - a.id);
  return out;
}

/* ---------------------------------------------------------------- API */

export async function getCategories(locale: Locale): Promise<Category[]> {
  if (!hasDatabase) {
    const s = suffix(locale);
    return sampleCategories
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c[`name${s}` as "nameUz"],
      }));
  }

  const { db, schema } = await import("@/db");
  const rows = await db
    .select()
    .from(schema.categories)
    .orderBy(asc(schema.categories.sortOrder));

  const s = suffix(locale);
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c[`name${s}` as "nameUz"],
  }));
}

export async function getProducts(
  locale: Locale,
  options: {
    category?: string;
    sort?: SortKey;
    limit?: number;
    query?: string;
  } = {},
): Promise<Product[]> {
  const { category, sort = "new", limit } = options;
  const query = normalizeQuery(options.query);

  if (!hasDatabase) {
    let list = sampleProducts
      .filter((p) => p.isActive)
      .filter((p) => !category || p.categorySlug === category)
      .map((p) => sampleToProduct(p, locale))
      .filter((p) => !query || matchesQuery(p, query));
    list = sortProducts(list, sort);
    return typeof limit === "number" ? list.slice(0, limit) : list;
  }

  const { db, schema } = await import("@/db");
  const s = suffix(locale);

  // Qidiruv joriy tildagi ustunlar bo'yicha ketadi — xaridor ko'rgan matn
  // bilan bir xil bo'lishi uchun.
  const nameColumn =
    locale === "ru"
      ? schema.products.nameRu
      : locale === "en"
        ? schema.products.nameEn
        : schema.products.nameUz;
  const descriptionColumn =
    locale === "ru"
      ? schema.products.descriptionRu
      : locale === "en"
        ? schema.products.descriptionEn
        : schema.products.descriptionUz;

  const pattern = `%${escapeLike(query)}%`;

  const rows = await db.query.products.findMany({
    where: and(
      eq(schema.products.isActive, true),
      category
        ? eq(
            schema.products.categoryId,
            db
              .select({ id: schema.categories.id })
              .from(schema.categories)
              .where(eq(schema.categories.slug, category))
              .limit(1),
          )
        : undefined,
      query
        ? or(
            ilike(nameColumn, pattern),
            ilike(descriptionColumn, pattern),
          )
        : undefined,
    ),
    with: { variants: true, category: true },
    orderBy:
      sort === "price-asc"
        ? asc(schema.products.price)
        : sort === "price-desc"
          ? desc(schema.products.price)
          : desc(schema.products.createdAt),
    limit,
  });

  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    categorySlug: p.category.slug,
    name: p[`name${s}` as "nameUz"],
    description: p[`description${s}` as "descriptionUz"],
    material: p[`material${s}` as "materialUz"],
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    isFeatured: p.isFeatured,
    variants: p.variants,
  }));
}

export async function getFeaturedProducts(locale: Locale, limit = 4) {
  const all = await getProducts(locale);
  const featured = all.filter((p) => p.isFeatured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

export async function getProductBySlug(
  locale: Locale,
  slug: string,
): Promise<Product | null> {
  if (!hasDatabase) {
    const found = sampleProducts.find((p) => p.slug === slug && p.isActive);
    return found ? sampleToProduct(found, locale) : null;
  }

  const { db, schema } = await import("@/db");
  const s = suffix(locale);

  const p = await db.query.products.findFirst({
    where: eq(schema.products.slug, slug),
    with: { variants: true, category: true },
  });

  if (!p || !p.isActive) return null;

  return {
    id: p.id,
    slug: p.slug,
    categorySlug: p.category.slug,
    name: p[`name${s}` as "nameUz"],
    description: p[`description${s}` as "descriptionUz"],
    material: p[`material${s}` as "materialUz"],
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    isFeatured: p.isFeatured,
    variants: p.variants,
  };
}

export async function getAllProductSlugs(): Promise<string[]> {
  if (!hasDatabase) {
    return sampleProducts.filter((p) => p.isActive).map((p) => p.slug);
  }
  const { db, schema } = await import("@/db");
  const rows = await db
    .select({ slug: schema.products.slug })
    .from(schema.products)
    .where(eq(schema.products.isActive, true));
  return rows.map((r) => r.slug);
}

/* ------------------------------------------------- buyurtma uchun variant */

/**
 * Savat qatori uchun serverdagi haqiqiy ma'lumot. Narx va zaxira faqat shu
 * yerdan olinadi — klient yuborgan narxga ishonib bo'lmaydi.
 */
export interface PricedVariant {
  variantId: number;
  productSlug: string;
  productName: string;
  size: string;
  colorName: string;
  colorHex: string;
  image: string;
  unitPrice: number;
  stock: number;
}

/**
 * Berilgan variant id'lari bo'yicha narx va zaxirani qaytaradi. Topilmagan
 * yoki nofaol mahsulotga tegishli id'lar ro'yxatga tushmaydi — chaqiruvchi
 * yetishmagan id'larni o'zi aniqlaydi.
 */
export async function getVariantsById(
  locale: Locale,
  ids: number[],
): Promise<PricedVariant[]> {
  const wanted = new Set(ids);
  if (wanted.size === 0) return [];

  if (!hasDatabase) {
    const s = suffix(locale);
    return sampleProducts
      .filter((p) => p.isActive)
      .flatMap((p) =>
        p.variants
          .filter((v) => wanted.has(v.id))
          .map((v) => ({
            variantId: v.id,
            productSlug: p.slug,
            productName: p[`name${s}` as "nameUz"],
            size: v.size,
            colorName: v.colorName,
            colorHex: v.colorHex,
            image: p.images[0] ?? "",
            unitPrice: p.price,
            stock: v.stock,
          })),
      );
  }

  const { db, schema } = await import("@/db");
  const s = suffix(locale);

  const rows = await db.query.productVariants.findMany({
    where: inArray(schema.productVariants.id, [...wanted]),
    with: { product: true },
  });

  return rows
    .filter((v) => v.product.isActive)
    .map((v) => ({
      variantId: v.id,
      productSlug: v.product.slug,
      productName: v.product[`name${s}` as "nameUz"],
      size: v.size,
      colorName: v.colorName,
      colorHex: v.colorHex,
      image: v.product.images[0] ?? "",
      unitPrice: v.product.price,
      stock: v.stock,
    }));
}
