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

    const finish = () => {
      setDone(true);
      document.body.style.overflow = previous;
    };

    const timer = window.setTimeout(finish, 2400);

    // Kutib turishni istamagan xaridor bosib yoki tugma bilan o'tkazib
    // yuborishi mumkin — aks holda har ochilishda 2.4 soniya kutiladi.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", finish);
    window.addEventListener("wheel", finish, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("wheel", finish);
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
