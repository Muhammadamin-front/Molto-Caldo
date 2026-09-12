"use client";

import { motion, useInView, type Variants } from "motion/react";
import type { ElementType, ReactNode, RefObject } from "react";

/**
 * `pricing-section` promptida ishlatilgan, lekin fayli berilmagan komponent.
 * Bolalarini `timelineRef` ko'rinadigan bo'lganda, `animationNum` bo'yicha
 * ketma-ket ochadi — saytdagi boshqa reveal'lar bilan bir xil his beradi.
 */
export function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants,
  as,
  className,
  once = true,
}: {
  children: ReactNode;
  animationNum: number;
  timelineRef: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  as?: ElementType;
  className?: string;
  once?: boolean;
}) {
  const inView = useInView(timelineRef, { once, amount: 0.15 });

  const defaultVariants: Variants = {
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: i * 0.12, duration: 0.5 },
    }),
    hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  };

  const MotionTag = motion[(as ?? "div") as "div"];

  return (
    <MotionTag
      custom={animationNum}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={customVariants ?? defaultVariants}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
