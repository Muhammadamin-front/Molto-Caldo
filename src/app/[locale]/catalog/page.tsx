import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getCategories, getProducts, type SortKey } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  return { title: t("title") };
}

const SORTS: { key: SortKey; label: keyof IntlMessages["catalog"] }[] = [
  { key: "new", label: "sortNew" },
  { key: "price-asc", label: "sortPriceAsc" },
  { key: "price-desc", label: "sortPriceDesc" },
];

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { category, sort } = await searchParams;
  const sortKey: SortKey =
    sort === "price-asc" || sort === "price-desc" ? sort : "new";

  const t = await getTranslations("catalog");
  const [categories, products] = await Promise.all([
    getCategories(locale),
    getProducts(locale, { category, sort: sortKey }),
  ]);

  function href(next: { category?: string; sort?: SortKey }) {
    const p = new URLSearchParams();
    const c = "category" in next ? next.category : category;
    const s = "sort" in next ? next.sort : sortKey;
    if (c) p.set("category", c);
    if (s && s !== "new") p.set("sort", s);
    const q = p.toString();
    return q ? `/catalog?${q}` : "/catalog";
  }

  return (
    <div className="mc-container py-10 lg:py-14">
      <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight">
        {t("title")}
      </h1>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <nav className="flex flex-wrap gap-2">
          <Link
            href={href({ category: undefined })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              !category
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)]",
            )}
          >
            {t("all")}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={href({ category: c.slug })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                category === c.slug
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                  : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--line-strong)]",
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--ink-mute)]">
            {t("results", { count: products.length })}
          </span>
          <div className="flex gap-1.5">
            {SORTS.map((s) => (
              <Link
                key={s.key}
                href={href({ sort: s.key })}
                className={cn(
                  "rounded-full px-3 py-1 text-xs transition-colors",
                  sortKey === s.key
                    ? "bg-[var(--surface-2)] font-semibold text-[var(--ink)]"
                    : "text-[var(--ink-mute)] hover:text-[var(--ink)]",
                )}
              >
                {t(s.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-[var(--ink-soft)]">{t("empty")}</p>
      ) : (
        <div
          className="mt-9 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
          data-stagger
        >
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              locale={locale}
              priority={i < 4}
            />
          ))}
        </div>
      )}
    </div>
  );
}
