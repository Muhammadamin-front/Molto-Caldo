'use client';
import { useEffect, useState } from 'react';
import {
  motion,
  VariantLabels,
  Target,
  TargetAndTransition,
  Transition,
} from 'motion/react';

export type TextRollProps = {
  children: string;
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  className?: string;
  transition?: Transition;
  variants?: {
    enter: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
    exit: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
  };

  onAnimationComplete?: () => void;
  /** Animatsiya to'xtamasdan takrorlansin. */
  loop?: boolean;
  /** Takrorlar orasidagi tanaffus, soniyada. */
  loopDelay?: number;
};

export function TextRoll({
  children,
  duration = 0.5,
  getEnterDelay = (i) => i * 0.1,
  getExitDelay = (i) => i * 0.1 + 0.2,
  className,
  transition = { ease: 'easeIn' },
  variants,
  onAnimationComplete,
  loop = false,
  loopDelay = 3.5,
}: TextRollProps) {
  // Har bir harfning kechikishi faqat birinchi ishga tushishda qo'llanadi,
  // shuning uchun tsiklni qaytarish uchun komponentni qayta o'rnatamiz —
  // shunda to'lqin har safar boshidan yuguradi.
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!loop) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const letterCount = children.length;
    const pass = duration + getEnterDelay(letterCount) + getExitDelay(letterCount);
    const period = Math.max(1.5, pass + loopDelay) * 1000;

    const id = window.setInterval(() => setCycle((n) => n + 1), period);
    return () => window.clearInterval(id);
  }, [loop, loopDelay, children, duration, getEnterDelay, getExitDelay]);
  const defaultVariants = {
    enter: {
      initial: { rotateX: 0 },
      animate: { rotateX: 90 },
    },
    exit: {
      initial: { rotateX: 90 },
      animate: { rotateX: 0 },
    },
  } as const;

  const letters = children.split('');

  // Har bir harfga umumiy indeks beramiz, lekin so'zlarni bo'lmaymiz.
  const words: { letter: string; index: number }[][] = [];
  let current: { letter: string; index: number }[] = [];
  letters.forEach((letter, index) => {
    if (letter === ' ') {
      if (current.length) words.push(current);
      words.push([{ letter, index }]);
      current = [];
    } else {
      current.push({ letter, index });
    }
  });
  if (current.length) words.push(current);

  return (
    <span className={className} key={cycle}>
      {words.map((word, wi) => (
        <span
          key={wi}
          className={
            word[0].letter === ' '
              ? 'inline-block'
              : 'inline-block whitespace-nowrap'
          }
        >
          {word.map(({ letter, index: i }) => (
          <span
            key={i}
            className='relative inline-block [perspective:10000px] [transform-style:preserve-3d] [width:auto]'
            aria-hidden='true'
          >
            <motion.span
              className='absolute inline-block [backface-visibility:hidden] [transform-origin:50%_25%]'
              initial={
                variants?.enter?.initial ?? defaultVariants.enter.initial
              }
              animate={
                variants?.enter?.animate ?? defaultVariants.enter.animate
              }
              transition={{
                ...transition,
                duration,
                delay: getEnterDelay(i),
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
            <motion.span
              className='absolute inline-block [backface-visibility:hidden] [transform-origin:50%_100%]'
              initial={variants?.exit?.initial ?? defaultVariants.exit.initial}
              animate={variants?.exit?.animate ?? defaultVariants.exit.animate}
              transition={{
                ...transition,
                duration,
                delay: getExitDelay(i),
              }}
              onAnimationComplete={
                letters.length === i + 1 ? onAnimationComplete : undefined
              }
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
            <span className='invisible'>
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          </span>
          ))}
        </span>
      ))}
      <span className='sr-only'>{children}</span>
    </span>
  );
}
