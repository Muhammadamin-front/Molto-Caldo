"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";

export function FinalCta() {
  const t = useTranslations("cta");

  return (
    <section className="relative isolate overflow-hidden bg-[#14100d] text-[#f4ede3]">
      <div className="absolute inset-0 -z-10 opacity-60">
        <LiquidEffectAnimation />
      </div>

      <div className="mc-container grid place-items-center py-24 text-center">
        <h2 className="max-w-2xl font-display text-[clamp(2rem,5vw,3.4rem)] leading-tight font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#b5a396]">
          {t("text")}
        </p>
        <Link
          href="/catalog"
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#e0653c] px-7 py-3.5 text-sm font-semibold text-[#1a1008] transition-transform duration-300 hover:-translate-y-0.5"
          style={{ transitionTimingFunction: "var(--ease)" }}
        >
          {t("button")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
