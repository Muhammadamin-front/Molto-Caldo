"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { SonarGrid } from "@/components/ui/sonar-grid";
import { TextRoll } from "@/components/ui/text-roll";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";

/**
 * Sonar to'ri fon sifatida — sichqoncha tekkan joyda to'lqin tarqaladi.
 * Sarlavha harflari TextRoll bilan birma-bir ag'dariladi.
 */
export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative isolate overflow-hidden">
      <SonarGrid
        className="absolute inset-0 -z-10"
        spacing={30}
        dotRadius={1.3}
        baseOpacity={0.13}
        color="var(--accent)"
        pingEvery={3.4}
        speed={190}
        amplitude={3.1}
        interactive
        seedPing
      />

      {/* Matn o'qilishi uchun fon ustidan yumshoq parda. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/80 to-transparent" />

      <div className="mc-container grid items-center gap-10 py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg)]/70 px-3 py-1.5 text-xs font-medium tracking-wide text-[var(--ink-soft)] uppercase backdrop-blur-sm">
            <span className="size-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
            {t("eyebrow")}
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.4rem,6.4vw,4.6rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
            <TextRoll duration={0.55} getEnterDelay={(i) => i * 0.035}>
              {t("heroTitle")}
            </TextRoll>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--ink-soft)]">
            {t("heroLead")}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/catalog" aria-label={t("shopNow")}>
              <AntiMetalButton
                label={t("shopNow")}
                accentFrom="#e63946"
                accentTo="#c01527"
                dotColor="#ffffff"
                className="h-12 w-56"
              />
            </Link>

            <Link
              href="/lookbook"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              {t("ourStory")}
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
