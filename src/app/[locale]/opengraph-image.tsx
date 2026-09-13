import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Havola ulashilganda ko'rinadigan rasm — Telegram, WhatsApp, Facebook.
 * Ilgari umuman yo'q edi: `twitter.card` "summary_large_image" deb turgan,
 * lekin rasmning o'zi bo'lmagan, ya'ni preview quruq matn bilan chiqardi.
 *
 * Ildiz segmentda turgani uchun barcha sahifalarga tarqaladi; mahsulot
 * sahifasi esa o'z fotosuratini `generateMetadata` da beradi.
 */
export const alt = "Molto Caldo — issiq ustki kiyim";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Fon uchun do'kondagi haqiqiy fotosurat.
  const photo = await readFile(
    join(process.cwd(), "public/products/cappotto-milano-1.jpg"),
  );
  const background = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0d0d0e",
        }}
      >
        <img
          src={background}
          alt=""
          width={size.width}
          height={size.height}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            objectFit: "cover",
          }}
        />

        {/* Matn har qanday fotosuratda o'qiladigan bo'lishi uchun. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            width: size.width,
            height: size.height,
            backgroundImage:
              "linear-gradient(90deg, rgba(10,10,11,0.95) 0%, rgba(10,10,11,0.88) 52%, rgba(10,10,11,0.45) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            padding: "0 88px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{ width: 54, height: 6, backgroundColor: "#e63946" }}
            />
            <div
              style={{
                fontSize: 24,
                letterSpacing: 8,
                color: "rgba(255,255,255,0.72)",
                textTransform: "uppercase",
              }}
            >
              O&apos;zbekiston
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: 26,
              fontSize: 104,
              fontWeight: 700,
              letterSpacing: -3,
              color: "#ffffff",
            }}
          >
            Molto
            <span style={{ color: "#e63946" }}>.</span>Caldo
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 38,
              color: "rgba(255,255,255,0.86)",
              maxWidth: 620,
              lineHeight: 1.25,
            }}
          >
            Issiq ustki kiyim — palto, kurtka, trikotaj
          </div>

          <div
            style={{
              marginTop: 34,
              display: "flex",
              gap: 14,
              fontSize: 26,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <span>moltocaldo.uz</span>
            <span>·</span>
            <span>+998 95 483 03 18</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
