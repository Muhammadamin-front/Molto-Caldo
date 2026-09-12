"use client";

/**
 * Ildiz layoutning o'zi yiqilganda ishlaydi. Bu fayl butun hujjatni
 * almashtiradi — global uslublar, shriftlar va tarjimalar bu yerga yetib
 * kelmaydi, shuning uchun matn asosiy tilda (uz) va uslub ichida yozilgan.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="uz">
      <body>
        <title>Xatolik — Molto Caldo</title>
        <style>{`
          :root { color-scheme: light dark; }
          body {
            margin: 0;
            min-height: 100dvh;
            display: grid;
            place-items: center;
            padding: 24px;
            background: #ffffff;
            color: #121212;
            font-family: system-ui, -apple-system, sans-serif;
            text-align: center;
          }
          h1 { margin: 0 0 12px; font-size: clamp(1.4rem, 4vw, 2rem); }
          p { margin: 0 0 24px; max-width: 32rem; color: #5b5b5f; line-height: 1.6; }
          button {
            border: 0;
            border-radius: 999px;
            padding: 13px 26px;
            font: inherit;
            font-weight: 600;
            color: #ffffff;
            background: #d21f30;
            cursor: pointer;
          }
          code { font-size: 12px; color: #8d8d93; }
          @media (prefers-color-scheme: dark) {
            body { background: #0d0d0e; color: #f6f6f7; }
            p { color: #aeaeb4; }
            button { background: #ff3b4a; color: #1a0405; }
          }
        `}</style>

        <main>
          <h1>Kutilmagan xatolik</h1>
          <p>
            Sahifani ko&apos;rsatib bo&apos;lmadi. Qaytadan urinib
            ko&apos;ring — muammo takrorlansa, buyurtmani telefon orqali
            berishingiz mumkin: +998 95 483 03 18.
          </p>
          <button type="button" onClick={() => retry()}>
            Qaytadan urinish
          </button>
          {error.digest && (
            <p style={{ marginTop: 24 }}>
              <code>{error.digest}</code>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
