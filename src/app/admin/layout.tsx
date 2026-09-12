import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "../globals.css";

/**
 * Admin panel do'kon layoutidan tashqarida turadi: `[locale]` segmentiga
 * kirmaydi, tarjima qilinmaydi (faqat o'zbek tilida) va proxy uni tilga
 * yo'naltirmaydi — `src/proxy.ts` dagi matcher'ga qarang.
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
  title: "Boshqaruv paneli — Molto Caldo",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className={`${fraunces.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
