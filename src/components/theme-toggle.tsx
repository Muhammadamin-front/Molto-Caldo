"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const t = useTranslations("nav");
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDark(document.documentElement.getAttribute("data-theme") === "dark");
      setMounted(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("mc_theme", next);
    } catch {
      /* saqlab bo'lmasa ham joriy sahifada ishlaydi */
    }
    setDark(!dark);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme")}
      className="grid size-9 place-items-center rounded-full border border-[var(--line)] text-[var(--ink-soft)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
    >
      {/* Server HTML hamisha oy ikonkasi bilan chiqadi; mount bo'lgach
          haqiqiy holatga o'tadi — hydration mos kelishi uchun. */}
      {mounted && dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
