import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Package, RefreshCw, Scissors, Truck } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getCategories, getFeaturedProducts, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { Hero } from "@/components/sections/hero";
import { LookbookCarousel } from "@/components/sections/lookbook-carousel";
import { Atelier } from "@/components/sections/atelier";
import { Reviews } from "@/components/sections/reviews";
import { FinalCta } from "@/components/sections/final-cta";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tl = await getTranslations("lookbook");

  const [featured, categories, all] = await Promise.all([
    getFeaturedProducts(locale, 4),
    getCategories(locale),
    getProducts(locale),
  ]);

  const values = [
    { icon: Package, title: t("value1Title"), text: t("value1Text") },
    { icon: Scissors, title: t("value2Title"), text: t("value2Text") },
    { icon: Truck, title: t("value3Title"), text: t("value3Text") },
    { icon: RefreshCw, title: t("value4Title"), text: t("value4Text") },
  ];

  // Karusel uchun: nom ikki qatorga bo'linadi, shunda tipografiya nafis chiqadi.
  const lookbookItems = all.slice(0, 6).map((p) => {
    const words = p.name.split(" ");
    return {
      tag: categories.find((c) => c.slug === p.categorySlug)?.name,
      titleLine1: words[0],
      titleLine2: words.slice(1).join(" "),
      desc: p.description,
      img: p.images[0] ?? "",
      ctaText: tl("cta"),
      ctaUrl: `/product/${p.slug}`,
    };
  });

  return (
    <>
      <Hero />

      {/* ------------------------------------------------------ categories */}
      <section id="below" className="mc-container py-14 reveal-section">
        <div className="grid gap-3 sm:grid-cols-3" data-stagger>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog?category=${c.slug}`}
              className="group flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-5 transition-colors hover:border-[var(--line-strong)]"
            >
              <span className="font-display text-lg font-medium">{c.name}</span>
              <ArrowRight
                size={18}
                className="text-[var(--ink-mute)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--accent)]"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- lookbook */}
      <section className="py-14 reveal-section">
        <div className="mc-container mb-2 text-center">
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            {tl("label")}
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-tight">
            {tl("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--ink-soft)]">
            {tl("lead")}
          </p>
        </div>
        <LookbookCarousel items={lookbookItems} sectionLabel="" />
      </section>

      {/* -------------------------------------------------------- featured */}
      <section className="mc-container py-16 reveal-section">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[clamp(1.7rem,3.5vw,2.5rem)] font-semibold tracking-tight">
              {t("featured")}
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              {t("featuredLead")}
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:gap-2.5"
            style={{ transition: "gap .3s var(--ease)" }}
          >
            {t("viewAll")} <ArrowRight size={15} />
          </Link>
        </div>

        <div
          className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4"
          data-stagger
        >
          {featured.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              locale={locale}
              priority={i < 2}
            />
          ))}
        </div>
      </section>

      <Atelier />

      {/* ---------------------------------------------------------- values */}
      <section className="border-b border-[var(--line)] bg-[var(--surface-2)] reveal-section">
        <div className="mc-container py-14">
          <h2 className="font-display text-[clamp(1.7rem,3.5vw,2.5rem)] font-semibold tracking-tight">
            {t("valuesTitle")}
          </h2>
          <div
            className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            data-stagger
          >
            {values.map((v) => (
              <div key={v.title}>
                <v.icon size={22} className="text-[var(--accent)]" />
                <h3 className="mt-4 font-display text-lg font-medium">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Reviews locale={locale} />
      <FinalCta />
    </>
  );
}
