"use client";

import { useTranslations } from "next-intl";
import KineticGrid from "@/components/ui/kinetic-grid";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

const TEAM = [
  { id: 1, name: "Dilnoza A.", designation: "atelier", image: "/people/dilnoza.jpg" },
  { id: 2, name: "Javohir T.", designation: "pattern", image: "/people/javohir.jpg" },
  { id: 3, name: "Kamola N.", designation: "quality", image: "/people/kamola.jpg" },
  { id: 4, name: "Aziz M.", designation: "logistics", image: "/people/aziz.jpg" },
];

export function Atelier() {
  const t = useTranslations("atelier");

  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0e] py-20 text-[#f6f6f7] reveal-section">
      <KineticGrid className="absolute inset-0 -z-10 opacity-70" />

      <div className="mc-container text-center">
        <p className="text-xs font-medium tracking-[0.28em] text-[#ff3b4a] uppercase">
          {t("eyebrow")}
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(1.8rem,4vw,2.8rem)] leading-tight font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#aeaeb4]">
          {t("text")}
        </p>

        <div className="mt-10 flex justify-center">
          <AnimatedTooltip
            items={TEAM.map((m) => ({
              ...m,
              designation: t(m.designation as "atelier"),
            }))}
          />
        </div>
      </div>
    </section>
  );
}
