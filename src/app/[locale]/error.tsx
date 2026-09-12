"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * Sahifa render qilinayotganda kutilmagan xato chiqsa — masalan baza javob
 * bermasa — Next shu komponentni ko'rsatadi. `retry` segmentni qaytadan
 * yuklaydi.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    // Server xatosining matni klientga yetib kelmaydi, faqat `digest` —
    // shu bilan server loglaridan aynan shu xatoni topish mumkin.
    console.error("[render] failed", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mc-container grid place-items-center py-28 text-center">
      <h1 className="font-display text-[clamp(1.5rem,4vw,2.25rem)] font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-[var(--ink-soft)]">{t("text")}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)]"
        >
          <RotateCcw size={16} />
          {t("retry")}
        </button>
        <Link
          href="/"
          className="rounded-full border border-[var(--line-strong)] px-6 py-3 text-sm font-medium hover:bg-[var(--surface-2)]"
        >
          {t("home")}
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 text-xs text-[var(--ink-mute)]">
          {t("code", { digest: error.digest })}
        </p>
      )}
    </div>
  );
}
