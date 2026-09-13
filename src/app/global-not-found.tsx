/* Bu sahifa router daraxtidan tashqarida render qilinadi, shuning uchun
   `next/link` emas, oddiy `<a>` ishlatiladi — 404 dan chiqishda sahifani
   to'liq qayta yuklash mutlaqo yetarli. */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

/**
 * Hech qanday yo'nalishga tushmagan manzillar (masalan `/blogg`) uchun.
 * Ildiz layout `[locale]` ichida bo'lgani uchun Next bunday manzilni layout
 * bilan ko'rsata olmaydi — shu fayl butun hujjatni o'zi yasaydi.
 *
 * Mahsulot topilmaganda esa `[locale]/not-found.tsx` ishlaydi va u tarjima
 * qilingan, sarlavha va footer bilan birga chiqadi.
 */

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sahifa topilmadi — Molto Caldo",
  description:
    "Bunday manzil yo'q. Molto Caldo katalogidan palto, kurtka va trikotaj tanlashingiz mumkin.",
};

export default function GlobalNotFound() {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Mavzu birinchi bo'yashdan oldin qo'yiladi — layout bu sahifaga
            yetib kelmaydi, shuning uchun skript shu yerda takrorlanadi. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mc_theme');if(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches){t='dark';}if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${fraunces.variable} ${inter.variable} antialiased`}>
        <div className="mc-container grid min-h-dvh place-items-center py-20 text-center">
          <div>
            <p className="font-display text-[clamp(3.5rem,12vw,7rem)] leading-none font-semibold text-[var(--accent)]">
              404
            </p>
            <h1 className="mt-4 font-display text-[clamp(1.5rem,4vw,2.25rem)] font-semibold tracking-tight">
              Sahifa topilmadi
            </h1>
            <p className="mt-3 text-[var(--ink-soft)]">
              Bunday manzil yo&apos;q. Katalogdan kiyimlarni ko&apos;rib
              chiqing.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/catalog"
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)]"
              >
                Katalogga o&apos;tish
              </a>
              <a
                href="/"
                className="rounded-full border border-[var(--line-strong)] px-6 py-3 text-sm font-medium hover:bg-[var(--surface-2)]"
              >
                Bosh sahifa
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
