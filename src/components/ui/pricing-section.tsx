"use client";

import { useId, useRef, useState } from "react";
import NumberFlow from "@number-flow/react";
import { Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { cn } from "@/lib/utils";

export interface PricingTier {
  name: string;
  price: number;
  priceNote: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

interface PricingSectionProps {
  tiers: { standard: PricingTier[]; express: PricingTier[] };
  standardLabel: string;
  expressLabel: string;
  currency: string;
}

function PricingSwitch({
  express,
  standardLabel,
  expressLabel,
  onChange,
}: {
  express: boolean;
  standardLabel: string;
  expressLabel: string;
  onChange: (express: boolean) => void;
}) {
  const layoutId = useId();

  return (
    <div
      className="inline-flex rounded-full border border-[var(--line-strong)] bg-[var(--surface-2)] p-1"
      role="group"
      aria-label={`${standardLabel} / ${expressLabel}`}
    >
      {[
        { label: standardLabel, value: false },
        { label: expressLabel, value: true },
      ].map((option) => {
        const active = express === option.value;
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "relative isolate rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              active
                ? "text-[var(--accent-ink)]"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]",
            )}
          >
            {active && (
              <motion.span
                layoutId={`pricing-switch-${layoutId}`}
                className="absolute inset-0 -z-10 rounded-full bg-[var(--accent)] shadow-[0_8px_24px_-12px_var(--accent)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * `pricing_prompt.md` komponentining Molto Caldo yetkazib berish tariflariga
 * moslashtirilgan ko'rinishi. NumberFlow, animatsiyali switch va timeline
 * ochilishi original prompt mexanikasini saqlaydi.
 */
export default function PricingSection({
  tiers,
  standardLabel,
  expressLabel,
  currency,
}: PricingSectionProps) {
  const [isExpress, setIsExpress] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const plans = isExpress ? tiers.express : tiers.standard;

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.14, duration: 0.5 },
    }),
    hidden: { filter: "blur(8px)", y: -16, opacity: 0 },
  };

  return (
    <section ref={sectionRef} className="mc-container py-12">
      <TimelineContent
        animationNum={0}
        timelineRef={sectionRef}
        customVariants={revealVariants}
        className="flex justify-center"
      >
        <PricingSwitch
          express={isExpress}
          standardLabel={standardLabel}
          expressLabel={expressLabel}
          onChange={setIsExpress}
        />
      </TimelineContent>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <TimelineContent
            key={`${isExpress ? "express" : "standard"}-${plan.name}`}
            animationNum={index + 1}
            timelineRef={sectionRef}
            customVariants={revealVariants}
          >
            <Card
              className={cn(
                "group relative h-full overflow-hidden transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1",
                plan.highlighted
                  ? "border-[var(--accent)] bg-[var(--surface-2)] shadow-[0_24px_60px_-38px_var(--accent)]"
                  : "hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-card)]",
              )}
            >
              {plan.highlighted && (
                <div className="absolute right-5 top-5 grid size-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
                  <Sparkles size={15} aria-hidden="true" />
                </div>
              )}

              <CardHeader className="pr-16">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  {plan.name}
                </h2>
                <p className="mt-2 min-h-10 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-[var(--line)] pb-6">
                  <NumberFlow
                    value={plan.price}
                    format={{ useGrouping: true }}
                    className="font-display text-[clamp(2.25rem,5vw,3.25rem)] font-semibold tracking-tight"
                  />
                  <span className="text-sm font-medium text-[var(--ink-soft)]">
                    {currency}
                  </span>
                  <p className="w-full text-xs text-[var(--ink-mute)]">
                    {plan.priceNote}
                  </p>
                </div>

                <ul className="space-y-3 pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">
                        <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                      </span>
                      <span className="leading-relaxed text-[var(--ink-soft)]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </section>
  );
}
