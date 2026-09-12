"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { SonarGrid } from "@/components/ui/sonar-grid";
import { TextRoll } from "@/components/ui/text-roll";
import { AntiMetalButton } from "@/components/ui/anti-metal-button";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const HERO_IMAGES = [
  { src: "/products/cappotto-milano-1.jpg", alt: "Cappotto Milano palto" },
  { src: "/products/giacca-alpina-1.jpg", alt: "Giacca Alpina kurtka" },
  { src: "/products/maglione-merino-1.jpg", alt: "Maglione Merino sviter" },
  { src: "/products/cappotto-roma-1.jpg", alt: "Cappotto Roma palto" },
  { src: "/products/bomber-inverno-1.jpg", alt: "Bomber Inverno kurtka" },
  { src: "/products/dolcevita-collo-1.jpg", alt: "Dolcevita Collo sviter" },
];

/**
 * Sonar to'ri fon sifatida — sichqoncha tekkan joyda to'lqin tarqaladi.
 * Sarlavha harflari TextRoll bilan birma-bir ag'dariladi.
 */
export function Hero() {
  const t = useTranslations("home");

  return (
    <section>
      <ImageStreamHero
        images={HERO_IMAGES}
        cards={10}
        speed={22}
        axis={58}
        path={{ cardWidth: 16, cardHeight: 24, exitHeight: 54, railExit: 48 }}
        className="mc-hero-stream isolate min-h-[calc(100svh-4rem)] bg-[#0a0a0b] text-white md:min-h-[calc(100svh-5rem)]"
      >
      <SonarGrid
        className="absolute inset-0 z-0 opacity-40"
        spacing={34}
        dotRadius={1.1}
        baseOpacity={0.08}
        color="#ff3b4a"
        pingEvery={4.2}
        speed={175}
        amplitude={2.5}
        interactive
        seedPing
      />

      {/* Harakatdagi rasmlar ustida sarlavhani doim o'qiladigan saqlaydi. */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_38%_54%_at_50%_43%,rgba(10,10,11,.98)_0%,rgba(10,10,11,.82)_52%,rgba(10,10,11,.16)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-36 bg-gradient-to-t from-[#0a0a0b] to-transparent" />

      <div className="mc-container relative z-10 flex min-h-[calc(100svh-4rem)] items-center justify-center py-20 text-center md:min-h-[calc(100svh-5rem)]">
        <div className="flex max-w-3xl flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-medium tracking-wide text-white/70 uppercase backdrop-blur-md">
            <span className="size-1.5 animate-pulse rounded-full bg-[#ff3b4a]" />
            {t("eyebrow")}
          </span>

          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.7rem,7vw,5.7rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance">
            <TextRoll
              loop
              loopDelay={2.6}
              duration={0.5}
              getEnterDelay={(i) => i * 0.03}
              getExitDelay={(i) => i * 0.03 + 0.28}
            >
              {t("heroTitle")}
            </TextRoll>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/62 md:text-lg">
            {t("heroLead")}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
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
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white/85"
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

      <a
        href="#below"
        aria-hidden="true"
        tabIndex={-1}
        className="mc-scroll-cue z-20 border-white/25"
      >
        <span />
      </a>
      </ImageStreamHero>
    </section>
  );
}
