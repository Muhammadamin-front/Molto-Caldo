"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LABEL: Record<Locale, string> = { uz: "UZ", ru: "RU", en: "EN" };

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[var(--line)] p-0.5">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
            l === locale
              ? "bg-[var(--ink)] text-[var(--bg)]"
              : "text-[var(--ink-mute)] hover:text-[var(--ink)]",
          )}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
