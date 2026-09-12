"use client";

import { useEffect, useState } from "react";

/**
 * Sayt ochilganda yoki yangilanganda ko'rinadigan salomlashuv pardasi.
 *
 * Parda serverdan kelgan HTML ichida ham bor — shuning uchun birinchi
 * bo'yashdayoq ko'rinadi va sayt "sakrab" ochilmaydi. Yashirilishini CSS
 * animatsiyasi bajaradi, JS esa faqat tugagach DOM'dan olib tashlaydi:
 * shunday qilib JS ishlamay qolsa ham parda saytni to'sib qolmaydi.
 */
export function IntroCurtain({
  welcome,
  tagline,
}: {
  welcome: string;
  tagline: string;
}) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const frame = window.requestAnimationFrame(() => setDone(true));
      return () => window.cancelAnimationFrame(frame);
    }

    // Parda turganda orqa fon surilmasin.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      setDone(true);
      document.body.style.overflow = previous;
    }, 2400);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, []);

  if (done) return null;

  return (
    <div className="mc-intro" aria-hidden="true">
      <div className="mc-intro-inner">
        <span className="mc-intro-brand">
          <i />
          <b>
            Molto<span>.</span>Caldo
          </b>
        </span>
        <p className="mc-intro-welcome">{welcome}</p>
        <span className="mc-intro-tagline">{tagline}</span>
        <span className="mc-intro-rule" />
      </div>
    </div>
  );
}
