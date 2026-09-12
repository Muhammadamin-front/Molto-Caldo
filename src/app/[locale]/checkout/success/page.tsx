import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ order?: string; demo?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { order, demo } = await searchParams;
  const t = await getTranslations("success");

  return (
    <div className="mc-container grid place-items-center py-28 text-center">
      <CheckCircle2 size={44} className="text-[var(--accent)]" />
      <h1 className="mt-6 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-[var(--ink-soft)]">
        {t("text", { number: order ?? "—" })}
      </p>
      {demo === "1" && (
        <p className="mt-5 max-w-md rounded-lg border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-3 text-xs leading-relaxed text-[var(--ink-mute)]">
          {t("demoNotice")}
        </p>
      )}

      <Link
        href="/"
        className="mt-8 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)]"
      >
        {t("home")}
      </Link>
    </div>
  );
}
