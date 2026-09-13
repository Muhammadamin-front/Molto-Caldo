import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/catalog";
import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/utils";

export function ProductCard({
  product,
  locale,
  priority = false,
}: {
  product: Product;
  locale: Locale;
  /** Birinchi ekranda turadimi — rasm kechiktirilmasdan yuklanadi. */
  priority?: boolean;
}) {
  const t = useTranslations("product");
  const colors = Array.from(
    new Map(product.variants.map((v) => [v.colorHex, v])).values(),
  );
  const inStock = product.variants.some((v) => v.stock > 0);
  const discounted =
    product.compareAtPrice !== null && product.compareAtPrice > product.price;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-[var(--surface-2)]">
        <Image
          src={product.images[0] ?? "/products/placeholder.jpg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading={priority ? "eager" : undefined}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ transitionTimingFunction: "var(--ease)" }}
        />

        {discounted && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[var(--accent-ink)]">
            −
            {Math.round(
              (1 - product.price / (product.compareAtPrice as number)) * 100,
            )}
            %
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 grid place-items-center bg-[var(--bg)]/60 backdrop-blur-[1px]">
            <span className="rounded-full border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-1 text-xs font-medium">
              {t("outOfStock")}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3.5">
        <h3 className="font-display text-[15px] leading-snug font-medium transition-colors group-hover:text-[var(--accent)]">
          {product.name}
        </h3>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold">
            {formatPrice(product.price, locale)}
          </span>
          {discounted && (
            <span className="text-xs text-[var(--ink-mute)] line-through">
              {formatPrice(product.compareAtPrice as number, locale)}
            </span>
          )}
        </div>

        {colors.length > 1 && (
          <div className="mt-2.5 flex gap-1.5">
            {colors.map((c) => (
              <span
                key={c.colorHex}
                title={c.colorName}
                className="size-3 rounded-full ring-1 ring-[var(--line-strong)]"
                style={{ backgroundColor: c.colorHex }}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
