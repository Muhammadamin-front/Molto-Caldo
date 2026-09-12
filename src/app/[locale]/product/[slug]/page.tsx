import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(locale, slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images.length ? [product.images[0]] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProductBySlug(locale, slug);
  if (!product) notFound();

  const t = await getTranslations("product");
  const all = await getProducts(locale, { category: product.categorySlug });
  const related = all.filter((p) => p.id !== product.id).slice(0, 4);

  const inStock = product.variants.some((v) => v.stock > 0);

  // Google mahsulot kartochkasini ko'rsatishi uchun.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: "Molto Caldo" },
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(0),
      priceCurrency: "UZS",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mc-container py-10 lg:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetail product={product} locale={locale} />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight reveal">
            {t("related")}
          </h2>
          <div
            className="mt-7 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4"
            data-stagger
          >
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </section>
      )}

      <p className="sr-only">{formatPrice(product.price, locale)}</p>
    </div>
  );
}
