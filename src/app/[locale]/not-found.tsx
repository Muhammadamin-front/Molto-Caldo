import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * `notFound()` chaqirilganda (masalan mavjud bo'lmagan mahsulot) va hech
 * qaysi yo'nalishga tushmagan manzillarda ko'rinadi. Sarlavha va footer
 * joyida qoladi — bu sahifa layout ichida render qilinadi.
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mc-container grid place-items-center py-28 text-center">
      <p className="font-display text-[clamp(3.5rem,12vw,7rem)] leading-none font-semibold text-[var(--accent)]">
        404
      </p>
      <h1 className="mt-4 font-display text-[clamp(1.5rem,4vw,2.25rem)] font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-[var(--ink-soft)]">{t("text")}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/catalog"
          className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)]"
        >
          {t("catalog")}
        </Link>
        <Link
          href="/"
          className="rounded-full border border-[var(--line-strong)] px-6 py-3 text-sm font-medium hover:bg-[var(--surface-2)]"
        >
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
