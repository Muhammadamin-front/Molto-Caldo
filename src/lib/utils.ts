import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/i18n/routing";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Narxlar bazada tiyinda saqlanadi; ko'rsatishda so'mga o'tkaziladi. */
export function formatPrice(tiyin: number, locale: Locale = "uz") {
  const sum = Math.round(tiyin / 100);
  const grouped = new Intl.NumberFormat(
    locale === "ru" ? "ru-RU" : locale === "en" ? "en-US" : "uz-UZ",
  ).format(sum);
  const suffix = locale === "ru" ? "сум" : locale === "en" ? "UZS" : "so'm";
  return `${grouped} ${suffix}`;
}

/** Bir mahsulotning ko'p tilli maydonidan joriy tilga mosini oladi. */
export function pickLocalized<T extends Record<string, unknown>>(
  row: T,
  base: string,
  locale: Locale,
): string {
  const key = `${base}${locale.charAt(0).toUpperCase()}${locale.slice(1)}`;
  const value = row[key] ?? row[`${base}Uz`];
  return typeof value === "string" ? value : "";
}

export function orderNumber() {
  const now = new Date();
  const stamp =
    `${now.getFullYear()}`.slice(2) +
    `${now.getMonth() + 1}`.padStart(2, "0") +
    `${now.getDate()}`.padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `MC-${stamp}-${rand}`;
}

/** O'zbekiston raqamlari: +998 XX XXX XX XX */
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("998")) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return input.trim();
}

export function isValidUzPhone(input: string) {
  return /^\+998\d{9}$/.test(normalizePhone(input));
}
