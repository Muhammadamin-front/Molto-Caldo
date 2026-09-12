import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Ildiz layout `[locale]` ichida — Next hech qaysi yo'nalishga tushmagan
    // manzilni layout bilan ko'rsata olmaydi. `global-not-found.tsx` shu
    // holat uchun, `next/dist/docs` shuni tavsiya qiladi.
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
