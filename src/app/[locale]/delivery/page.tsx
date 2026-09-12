import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { DeliveryTiers, type Tier } from "@/components/sections/delivery-tiers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "delivery" });
  return { title: t("title"), description: t("lead") };
}

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("delivery");
  const tc = await getTranslations("common");

  const tiers = {
    standard: t.raw("tiers.standard") as Tier[],
    express: t.raw("tiers.express") as Tier[],
  };

  return (
    <div className="py-12 lg:py-16">
      <div className="mc-container">
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-lg text-sm text-[var(--ink-soft)]">
          {t("lead")}
        </p>
      </div>

      <DeliveryTiers
        tiers={tiers}
        standardLabel={t("standardLabel")}
        expressLabel={t("expressLabel")}
        currency={tc("currency")}
      />
    </div>
  );
}
