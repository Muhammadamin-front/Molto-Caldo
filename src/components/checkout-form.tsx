"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { CreditCard, Wallet, Banknote } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { useCart } from "@/components/cart-provider";
import { cn, formatPrice, isValidUzPhone } from "@/lib/utils";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

type Method = "click" | "payme" | "cash";

const METHODS: { key: Method; icon: typeof CreditCard; label: string }[] = [
  { key: "click", icon: CreditCard, label: "payClick" },
  { key: "payme", icon: Wallet, label: "payPayme" },
  { key: "cash", icon: Banknote, label: "payCash" },
];

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();

  const [method, setMethod] = useState<Method>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  if (lines.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-[var(--ink-soft)]">{tc("empty")}</p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)]"
        >
          {tc("emptyAction")}
        </Link>
      </div>
    );
  }

  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const data = new FormData(event.currentTarget);
    const values = {
      customerName: String(data.get("customerName") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      city: String(data.get("city") ?? "").trim(),
      address: String(data.get("address") ?? "").trim(),
      note: String(data.get("note") ?? "").trim(),
    };

    const next: Record<string, string> = {};
    if (values.customerName.length < 2) next.customerName = t("required");
    if (!isValidUzPhone(values.phone)) next.phone = t("invalidPhone");
    if (values.city.length < 2) next.city = t("required");
    if (values.address.length < 4) next.address = t("required");

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          paymentMethod: method,
          locale,
          lines: lines.map((l) => ({
            variantId: l.variantId,
            productSlug: l.productSlug,
            name: l.name,
            size: l.size,
            colorName: l.colorName,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error(`status ${response.status}`);

      const result: { orderNumber: string } = await response.json();
      clear();
      router.push(`/checkout/success?order=${result.orderNumber}`);
    } catch (error) {
      console.error("[checkout] submit failed", error);
      setFormError(t("error"));
      setSubmitting(false);
    }
  }

  const field =
    "mt-1.5 w-full rounded-lg border bg-[var(--surface)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-9 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14"
    >
      <div className="space-y-9">
        <fieldset>
          <legend className="font-display text-lg font-medium">
            {t("contactSection")}
          </legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">{t("name")}</span>
              <input
                name="customerName"
                autoComplete="name"
                className={cn(
                  field,
                  errors.customerName
                    ? "border-[var(--accent)]"
                    : "border-[var(--line-strong)]",
                )}
              />
              {errors.customerName && (
                <span className="mt-1 block text-xs text-[var(--accent)]">
                  {errors.customerName}
                </span>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium">{t("phone")}</span>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                className={cn(
                  field,
                  errors.phone
                    ? "border-[var(--accent)]"
                    : "border-[var(--line-strong)]",
                )}
              />
              {errors.phone && (
                <span className="mt-1 block text-xs text-[var(--accent)]">
                  {errors.phone}
                </span>
              )}
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-lg font-medium">
            {t("deliverySection")}
          </legend>
          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="text-sm font-medium">{t("city")}</span>
              <input
                name="city"
                autoComplete="address-level2"
                className={cn(
                  field,
                  errors.city
                    ? "border-[var(--accent)]"
                    : "border-[var(--line-strong)]",
                )}
              />
              {errors.city && (
                <span className="mt-1 block text-xs text-[var(--accent)]">
                  {errors.city}
                </span>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium">{t("address")}</span>
              <input
                name="address"
                autoComplete="street-address"
                className={cn(
                  field,
                  errors.address
                    ? "border-[var(--accent)]"
                    : "border-[var(--line-strong)]",
                )}
              />
              {errors.address && (
                <span className="mt-1 block text-xs text-[var(--accent)]">
                  {errors.address}
                </span>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium">{t("note")}</span>
              <textarea
                name="note"
                rows={3}
                placeholder={t("notePlaceholder")}
                className={cn(field, "resize-y border-[var(--line-strong)]")}
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-display text-lg font-medium">
            {t("paymentSection")}
          </legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {METHODS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethod(m.key)}
                aria-pressed={method === m.key}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-4 py-3.5 text-sm font-medium transition-colors",
                  method === m.key
                    ? "border-[var(--ink)] bg-[var(--surface-2)]"
                    : "border-[var(--line-strong)] hover:bg-[var(--surface-2)]",
                )}
              >
                <m.icon size={17} className="text-[var(--accent)]" />
                {t(m.label as "payClick")}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="h-fit rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-medium">
          {t("orderSummary")}
        </h2>

        <ul className="mt-4 space-y-3 border-b border-[var(--line)] pb-4 text-sm">
          {lines.map((l) => (
            <li key={l.variantId} className="flex justify-between gap-3">
              <span className="text-[var(--ink-soft)]">
                {l.name}
                <span className="text-[var(--ink-mute)]">
                  {" "}
                  · {l.size} · {l.quantity}×
                </span>
              </span>
              <span className="shrink-0 font-medium">
                {formatPrice(l.unitPrice * l.quantity, locale)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--ink-soft)]">{tc("subtotal")}</dt>
            <dd>{formatPrice(subtotal, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--ink-soft)]">{tc("delivery")}</dt>
            <dd>
              {delivery === 0
                ? tc("deliveryFree")
                : formatPrice(delivery, locale)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-[var(--line)] pt-2.5 text-base font-semibold">
            <dt>{tc("total")}</dt>
            <dd>{formatPrice(total, locale)}</dd>
          </div>
        </dl>

        {formError && (
          <p className="mt-4 rounded-lg bg-[var(--accent)]/10 px-3 py-2 text-xs text-[var(--accent)]">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          style={{ transitionTimingFunction: "var(--ease)" }}
        >
          {submitting ? t("submitting") : t("submit")}
        </button>
      </aside>
    </form>
  );
}
