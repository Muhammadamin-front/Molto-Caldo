import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getCategories, getProducts } from "@/lib/catalog";
import { Collections } from "@/components/sections/collections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lookbook" });
  return { title: t("pageTitle") };
}

const GRADIENTS = [
  "linear-gradient(135deg,#e63946,#a5142a)",
  "linear-gradient(135deg,#2c2c30,#141416)",
  "linear-gradient(135deg,#f2f2f3,#c9c9ce)",
];

export default async function LookbookPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("lookbook");
  const [categories, products] = await Promise.all([
    getCategories(locale),
    getProducts(locale),
  ]);

  const groups = categories.map((c, i) => ({
    title: c.name,
    gradient: GRADIENTS[i % GRADIENTS.length],
    products: products.filter((p) => p.categorySlug === c.slug),
  }));

  return (
    <div className="mc-container py-12 lg:py-16">
      <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight">
        {t("pageTitle")}
      </h1>
      <p className="mt-3 max-w-lg text-sm text-[var(--ink-soft)]">
        {t("pageLead")}
      </p>

      <div className="mt-12">
        <Collections
          groups={groups}
          countLabel={t("pieces")}
          hoverLabel={t("hover")}
        />
      </div>
    </div>
  );
}
