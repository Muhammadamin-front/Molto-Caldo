"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { SortKey } from "@/lib/catalog";

/**
 * Katalog qidiruvi. Manzil qatoriga `?q=` yozadi, filtrlash serverda
 * bo'ladi — shunday qilib natija havolasini ulashsa ham ishlaydi.
 */
export function CatalogSearch({
  query,
  category,
  sort,
}: {
  query: string;
  category?: string;
  sort: SortKey;
}) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const [value, setValue] = useState(query);

  function go(next: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (sort !== "new") params.set("sort", sort);
    if (next.trim()) params.set("q", next.trim());
    const search = params.toString();
    router.push(search ? `/catalog?${search}` : "/catalog");
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        go(value);
      }}
      className="relative w-full sm:max-w-xs"
    >
      <Search
        size={16}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--ink-mute)]"
      />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchLabel")}
        className="w-full rounded-full border border-[var(--line-strong)] bg-[var(--surface)] py-2 pr-9 pl-9.5 text-sm outline-none transition-colors focus:border-[var(--accent)]"
      />
      {value && (
        <button
          type="button"
          aria-label={t("searchClear")}
          onClick={() => {
            setValue("");
            go("");
          }}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
        >
          <X size={15} />
        </button>
      )}
    </form>
  );
}
