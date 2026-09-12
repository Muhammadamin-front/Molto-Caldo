import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/lib/catalog";
import { routing, type Locale } from "@/i18n/routing";

/** Indekslanadigan sahifalar. Savat va buyurtma sahifalari `noindex`. */
const STATIC_PATHS = ["/", "/catalog", "/lookbook", "/delivery", "/contact"];

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * `localePrefix: "as-needed"` — asosiy til (uz) prefikssiz ishlaydi,
 * qolganlari `/ru`, `/en` ko'rinishida.
 */
function localeUrl(locale: Locale, path: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const suffix = path === "/" ? "" : path;
  return `${SITE_URL}${prefix}${suffix}` || SITE_URL;
}

/** Har bir sahifa uchun hreflang xaritasi — uchta til bir-birini ko'rsatadi. */
function alternates(path: string) {
  return {
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, localeUrl(locale, path)]),
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllProductSlugs();
  const paths = [...STATIC_PATHS, ...slugs.map((slug) => `/product/${slug}`)];
  const lastModified = new Date();

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified,
      changeFrequency: path.startsWith("/product/")
        ? ("weekly" as const)
        : ("monthly" as const),
      priority: path === "/" ? 1 : path.startsWith("/product/") ? 0.8 : 0.6,
      alternates: alternates(path),
    })),
  );
}
