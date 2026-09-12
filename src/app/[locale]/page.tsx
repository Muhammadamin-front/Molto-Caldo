import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Package, RefreshCw, Scissors, Truck } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(locale, 4),
    getCategories(locale),
  ]);

  const values = [
    { icon: Package, title: t("value1Title"), text: t("value1Text") },
    { icon: Scissors, title: t("value2Title"), text: t("value2Text") },
    { icon: Truck, title: t("value3Title"), text: t("value3Text") },
    { icon: RefreshCw, title: t("value4Title"), text: t("value4Text") },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="mc-container grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
        <div className="mc-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-medium tracking-wide text-[var(--ink-soft)] uppercase">
            <span className="size-1.5 rounded-full bg-[var(--accent)]" />
            {t("eyebrow")}
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.04] font-semibold tracking-[-0.02em]">
            {t("heroTitle")}
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--ink-soft)]">
            {t("heroLead")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
              style={{ transitionTimingFunction: "var(--ease)" }}
            >
              {t("shopNow")}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full border border-[var(--line-strong)] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--surface-2)]"
            >
              {t("ourStory")}
            </Link>
          </div>
        </div>

        <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-[var(--surface-2)] lg:aspect-3/4">
          <Image
            src="/products/cappotto-milano-1.jpg"
            alt={t("heroTitle")}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* ------------------------------------------------------ categories */}
      <section className="mc-container py-10">
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

      {/* -------------------------------------------------------- featured */}
      <section className="mc-container py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 reveal">
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

      {/* ---------------------------------------------------------- values */}
      <section className="border-y border-[var(--line)] bg-[var(--surface-2)]">
        <div className="mc-container py-14">
          <h2 className="font-display text-[clamp(1.7rem,3.5vw,2.5rem)] font-semibold tracking-tight reveal">
            {t("valuesTitle")}
          </h2>

          <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
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
    </>
  );
}
