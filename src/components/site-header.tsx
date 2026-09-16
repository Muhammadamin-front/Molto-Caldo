"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/catalog", key: "catalog" },
  { href: "/lookbook", key: "lookbook" },
  { href: "/delivery", key: "delivery" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobil menyu ochiqligida orqa fon suriladigan bo'lib qolmasin.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
      style={{ transitionTimingFunction: "var(--ease)" }}
    >
      <div className="mc-container flex h-16 items-center justify-between gap-4 md:h-20">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight md:text-xl"
        >
          Molto<span className="text-[var(--accent)]">.</span>Caldo
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--accent)] after:transition-[width] after:duration-300 hover:after:w-full"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <NextLink
              href="/admin/login"
              className="rounded-full border border-[var(--line-strong)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {t("login")}
            </NextLink>
            <Link
              href="/contact"
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5"
              style={{ transitionTimingFunction: "var(--ease)" }}
            >
              {t("signUp")}
            </Link>
          </div>

          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          <ThemeToggle />

          <Link
            href="/cart"
            aria-label={t("cart")}
            className="relative grid size-9 place-items-center rounded-full border border-[var(--line)] text-[var(--ink-soft)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
          >
            <ShoppingBag size={16} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid size-4.5 min-w-4.5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-[var(--accent-ink)]">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-full border border-[var(--line)] text-[var(--ink-soft)] md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--line)] bg-[var(--bg)] md:hidden">
          <nav className="mc-container flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-[var(--line)] py-3.5 font-display text-lg last:border-0"
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="py-4 sm:hidden">
              <LocaleSwitcher />
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-[var(--line)] py-4">
              <NextLink
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[var(--line-strong)] px-4 py-3 text-center text-sm font-semibold text-[var(--ink)]"
              >
                {t("login")}
              </NextLink>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-semibold text-[var(--accent-ink)]"
              >
                {t("signUp")}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
