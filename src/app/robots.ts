import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Savat va buyurtma sahifalarida indekslanadigan narsa yo'q; ular har
      // bir xaridor uchun boshqacha ko'rinadi.
      disallow: [
        "/api/",
        "/admin",
        "/cart",
        "/checkout",
        "/*/cart",
        "/*/checkout",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
