import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getCategories, getProducts } from "@/lib/catalog";
import { Collections } from "@/components/sections/collections";
import OrbitFlipSlider from "@/components/ui/orbit-flip-slider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lookbook" });
  return { title: t("pageTitle") };
}

const GRADIENTS = [
  "linear-gradient(135deg,#e63946,#a5142a)",
  "linear-gradient(135deg,#2c2c30,#141416)",
  "linear-gradient(135deg,#f2f2f3,#c9c9ce)",
];

export default async function LookbookPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("lookbook");
  const [categories, products] = await Promise.all([
    getCategories(locale),
    getProducts(locale),
  ]);

  const groups = categories.map((c, i) => ({
    title: c.name,
    gradient: GRADIENTS[i % GRADIENTS.length],
    products: products.filter((p) => p.categorySlug === c.slug),
  }));

  // Orbit uchun 16 karta kerak; katalog kichik bo'lsa suratlar takrorlanadi.
  const photos = products.flatMap((p) =>
    p.images.map((image) => ({ image, alt: p.name })),
  );
  const orbitItems = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    ...photos[i % photos.length],
  }));

  return (
    <>
      <div className="mc-container py-12 lg:py-16">
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight">
          {t("pageTitle")}
        </h1>
        <p className="mt-3 max-w-lg text-sm text-[var(--ink-soft)]">
          {t("pageLead")}
        </p>
      </div>

      {/* Butun kenglikni oladi — mc-container ichida emas. */}
      {photos.length > 0 && (
        <section aria-label={t("orbitTitle")} className="border-y border-[var(--line)]">
          <OrbitFlipSlider
            items={orbitItems}
            modeLabels={{
              flat: t("orbitFlat"),
              tilt: t("orbitTilt"),
              ring: t("orbitRing"),
              gallery: t("orbitGallery"),
            }}
            backgroundColor="var(--surface-2)"
            imageWidth={90}
            imageHeight={140}
            imageGap={0}
            rounded="rounded-none"
            enableHoverMovement
            hoverMoveY={-8}
            perspectiveRotateValue={180}
            perspectiveRotateDirection="right"
            rotate
            rotateSpeed={4}
            stopRotationOnHover
            flatRadiusX={1.6}
            flatRadiusY={1.2}
            flatScale={1}
            ringRotateX={31}
            ringRotateY={56}
            ringRotateZ={-25}
            ringRadiusX={1.5}
            ringRadiusY={1.2}
            ringScale={1}
            tiltRotateX={70}
            tiltRotateY={0}
            tiltRotateZ={0}
            tiltRadiusX={1.9}
            tiltRadiusY={1.5}
            tiltScale={1.2}
            tiltMoveY={300}
            galleryRotateX={0}
            galleryRotateY={0}
            galleryRotateZ={0}
            galleryRadiusX={1.3}
            galleryRadiusY={1.5}
            galleryScale={1.2}
          />
        </section>
      )}

      <div className="mc-container py-12 lg:py-16">
        {/* Papkalar ichida h3 bor — h1 dan keyin darajani o'tkazib yubormaslik uchun. */}
        <h2 className="sr-only">{t("pageTitle")}</h2>
        <Collections
          groups={groups}
          countLabel={t("pieces")}
          hoverLabel={t("hover")}
          viewLabel={t("cta")}
        />
      </div>
    </>
  );
}
