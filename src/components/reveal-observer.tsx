"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Portfolio saytdagi reveal tizimining aynan o'zi: IntersectionObserver
 * ko'rinadigan `.reveal` elementlariga `.in` qo'shadi, qolganini CSS bajaradi.
 * Harakatni kamaytirish yoqilgan bo'lsa, hamma narsa darrov ko'rsatiladi.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal, [data-stagger]"),
    );
    if (nodes.length === 0) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    nodes.forEach((n) => {
      if (!n.classList.contains("in")) observer.observe(n);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
