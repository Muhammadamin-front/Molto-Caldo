"use client";

import { useRef, useState } from "react";
import NumberFlow from "@number-flow/react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { cn } from "@/lib/utils";

export interface Tier {
  name: string;
  price: number;
  priceNote: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

/**
 * `pricing_prompt.md` dagi mexanika — NumberFlow bilan jonlanadigan raqamlar
 * va TimelineContent bilan ketma-ket ochilish — Molto Caldo palitrasida.
 * Original demo uslubi (oq fon, ko'k dog') brendga to'g'ri kelmadi.
 */
export function DeliveryTiers({
  tiers,
  expressLabel,
  standardLabel,
  currency,
}: {
  tiers: { standard: Tier[]; express: Tier[] };
  expressLabel: string;
  standardLabel: string;
  currency: string;
}) {
  const [isExpress, setIsExpress] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const list = isExpress ? tiers.express : tiers.standard;

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.18, duration: 0.5 },
    }),
    hidden: { filter: "blur(8px)", y: -16, opacity: 0 },
  };

  return (
    <div ref={sectionRef} className="mc-container py-12">
      {/* --------------------------------------------------- rejim almashtirgich */}
      <TimelineContent
        animationNum={0}
        timelineRef={sectionRef}
        customVariants={revealVariants}
        className="flex justify-center"
      >
        <div className="inline-flex rounded-full border border-[var(--line-strong)] bg-[var(--surface-2)] p-1">
          {[
            { label: standardLabel, active: !isExpress, value: false },
            { label: expressLabel, active: isExpress, value: true },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setIsExpress(option.value)}
              aria-pressed={option.active}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                option.active
                  ? "bg-[var(--ink)] text-[var(--bg)]"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </TimelineContent>

      {/* ------------------------------------------------------------- tariflar */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {list.map((tier, i) => (
          <TimelineContent
            key={tier.name}
            animationNum={i + 1}
            timelineRef={sectionRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                "h-full transition-colors",
                tier.highlighted
                  ? "border-[var(--accent)] bg-[var(--surface-2)] shadow-[0_20px_50px_-30px_var(--accent)]"
                  : "hover:border-[var(--line-strong)]",
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold">
                    {tier.name}
                  </h3>
                  {tier.highlighted && (
                    <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent-ink)]">
                      ★
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  {tier.description}
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex items-baseline gap-1.5">
                  <NumberFlow
                    value={tier.price}
                    format={{ useGrouping: true }}
                    className="font-display text-4xl font-semibold"
                  />
                  <span className="text-sm text-[var(--ink-soft)]">
                    {currency}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--ink-mute)]">
                  {tier.priceNote}
                </p>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-[var(--accent)]"
                      />
                      <span className="text-[var(--ink-soft)]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}
