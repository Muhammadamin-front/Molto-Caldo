"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/utils";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

export function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { lines, subtotal, setQuantity, remove, adjusted } = useCart();

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-[var(--ink-soft)]">{t("empty")}</p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)]"
        >
          {t("emptyAction")}
        </Link>
      </div>
    );
  }

  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  return (
    <div className="mt-9 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
      {adjusted && (
        <p className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-3 text-sm text-[var(--ink-soft)] lg:col-span-2">
          {t("adjusted")}
        </p>
      )}

      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {lines.map((line, index) => (
          <li key={line.variantId} className="flex gap-4 py-5">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-2)] sm:size-28">
              {line.image && (
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="112px"
                  loading={index === 0 ? "eager" : undefined}
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/product/${line.productSlug}`}
                    className="-my-1 inline-block py-1 font-display text-[15px] font-medium hover:text-[var(--accent)]"
                  >
                    {line.name}
                  </Link>
                  <p className="mt-1 flex items-center gap-2 text-xs text-[var(--ink-soft)]">
                    <span
                      className="size-2.5 rounded-full ring-1 ring-[var(--line-strong)]"
                      style={{ backgroundColor: line.colorHex }}
                    />
                    {line.colorName} · {line.size}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => remove(line.variantId)}
                  aria-label={t("remove")}
                  className="-m-1 shrink-0 rounded-full p-2 text-[var(--ink-mute)] transition-colors hover:text-[var(--accent)]"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                <div className="flex items-center rounded-full border border-[var(--line-strong)]">
                  <button
                    type="button"
                    aria-label="−"
                    onClick={() =>
                      setQuantity(line.variantId, line.quantity - 1)
                    }
                    className="grid size-8 place-items-center rounded-full text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="+"
                    disabled={line.quantity >= line.maxStock}
                    onClick={() =>
                      setQuantity(line.variantId, line.quantity + 1)
                    }
                    className="grid size-8 place-items-center rounded-full text-[var(--ink-soft)] hover:text-[var(--ink)] disabled:opacity-35"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span className="text-sm font-semibold">
                  {formatPrice(line.unitPrice * line.quantity, locale)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-6 lg:sticky lg:top-24">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--ink-soft)]">{t("subtotal")}</dt>
            <dd className="font-medium">{formatPrice(subtotal, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--ink-soft)]">{t("delivery")}</dt>
            <dd className="font-medium">
              {delivery === 0 ? t("deliveryFree") : formatPrice(delivery, locale)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[var(--line)] pt-3 text-base">
            <dt className="font-semibold">{t("total")}</dt>
            <dd className="font-semibold">{formatPrice(total, locale)}</dd>
          </div>
        </dl>

        {delivery > 0 && (
          <p className="mt-4 text-xs leading-relaxed text-[var(--ink-mute)]">
            {t("freeShippingNote", {
              amount: formatPrice(FREE_DELIVERY_THRESHOLD, locale),
            })}
          </p>
        )}

        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
          style={{ transitionTimingFunction: "var(--ease)" }}
        >
          {t("checkout")}
        </Link>

        <Link
          href="/catalog"
          className="mt-2 block py-2 text-center text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          {t("continue")}
        </Link>
      </aside>
    </div>
  );
}
