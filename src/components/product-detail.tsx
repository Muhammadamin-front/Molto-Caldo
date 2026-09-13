"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/catalog";
import type { Locale } from "@/i18n/routing";
import { useCart } from "@/components/cart-provider";
import { cn, formatPrice } from "@/lib/utils";

const PLACEHOLDER = "/products/placeholder.jpg";

export function ProductDetail({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const t = useTranslations("product");
  const { add } = useCart();

  const colors = useMemo(
    () =>
      Array.from(
        new Map(
          product.variants.map((v) => [
            v.colorHex,
            { name: v.colorName, hex: v.colorHex },
          ]),
        ).values(),
      ),
    [product.variants],
  );

  const [colorHex, setColorHex] = useState(colors[0]?.hex ?? "");
  const [size, setSize] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const images = product.images.length > 0 ? product.images : [PLACEHOLDER];

  // Tanlangan rangdagi o'lchamlar — zaxirasi yo'qlari o'chirilgan holda.
  const sizesForColor = useMemo(
    () => product.variants.filter((v) => v.colorHex === colorHex),
    [product.variants, colorHex],
  );

  const selected = sizesForColor.find((v) => v.size === size) ?? null;
  const discounted =
    product.compareAtPrice !== null && product.compareAtPrice > product.price;

  function handleAdd() {
    if (!selected || selected.stock < 1) return;
    add({
      variantId: selected.id,
      productSlug: product.slug,
      name: product.name,
      image: images[imageIndex] ?? "",
      size: selected.size,
      colorName: selected.colorName,
      colorHex: selected.colorHex,
      unitPrice: product.price,
      quantity: 1,
      maxStock: selected.stock,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-[var(--surface-2)]">
          <Image
            src={images[imageIndex] ?? "/products/placeholder.jpg"}
            alt={product.name}
            fill
            preload
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Bitta suratli mahsulotda lenta ko'rsatilmaydi. */}
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setImageIndex(index)}
                aria-label={t("imageAlt", { index: index + 1 })}
                aria-pressed={index === imageIndex}
                className={cn(
                  "relative aspect-3/4 overflow-hidden rounded-lg bg-[var(--surface-2)] transition-all",
                  index === imageIndex
                    ? "ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--bg)]"
                    : "ring-1 ring-[var(--line)] hover:ring-[var(--ink-mute)]",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 25vw, 12vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.75rem)] leading-tight font-semibold tracking-tight">
          {product.name}
        </h1>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-semibold">
            {formatPrice(product.price, locale)}
          </span>
          {discounted && (
            <span className="text-base text-[var(--ink-mute)] line-through">
              {formatPrice(product.compareAtPrice as number, locale)}
            </span>
          )}
        </div>

        {/* ------------------------------------------------------- ranglar */}
        <div className="mt-8">
          <p className="text-sm font-semibold">
            {t("color")}
            <span className="ml-2 font-normal text-[var(--ink-soft)]">
              {colors.find((c) => c.hex === colorHex)?.name}
            </span>
          </p>
          <div className="mt-3 flex gap-2.5">
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                aria-label={c.name}
                aria-pressed={colorHex === c.hex}
                onClick={() => {
                  setColorHex(c.hex);
                  setSize(null);
                }}
                className={cn(
                  "size-9 rounded-full ring-offset-2 ring-offset-[var(--bg)] transition-all",
                  colorHex === c.hex
                    ? "ring-2 ring-[var(--ink)]"
                    : "ring-1 ring-[var(--line-strong)] hover:ring-[var(--ink-mute)]",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------- o'lchamlar */}
        <div className="mt-7">
          <p className="text-sm font-semibold">{t("size")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizesForColor.map((v) => {
              const disabled = v.stock < 1;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  aria-pressed={size === v.size}
                  onClick={() => setSize(v.size)}
                  className={cn(
                    "min-w-14 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                    disabled &&
                      "cursor-not-allowed border-[var(--line)] text-[var(--ink-mute)] line-through opacity-50",
                    !disabled && size === v.size
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : !disabled &&
                          "border-[var(--line-strong)] hover:bg-[var(--surface-2)]",
                  )}
                >
                  {v.size}
                </button>
              );
            })}
          </div>

          {selected && selected.stock > 0 && selected.stock <= 3 && (
            <p className="mt-3 text-xs font-medium text-[var(--accent)]">
              {t("lowStock", { count: selected.stock })}
            </p>
          )}
        </div>

        {/* -------------------------------------------------------- savatga */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected || selected.stock < 1}
          className={cn(
            "mt-8 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-all duration-300",
            !selected
              ? "cursor-not-allowed bg-[var(--surface-2)] text-[var(--ink-mute)]"
              : justAdded
                ? "bg-[var(--ink)] text-[var(--bg)]"
                : "bg-[var(--accent)] text-[var(--accent-ink)] hover:-translate-y-0.5",
          )}
          style={{ transitionTimingFunction: "var(--ease)" }}
        >
          {justAdded ? (
            <>
              <Check size={17} /> {t("added")}
            </>
          ) : (
            <>
              <ShoppingBag size={17} />
              {!selected ? t("selectSize") : t("addToCart")}
            </>
          )}
        </button>

        {/* --------------------------------------------------------- matnlar */}
        <div className="mt-10 space-y-6 border-t border-[var(--line)] pt-8">
          <div>
            <h2 className="text-sm font-semibold">{t("description")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              {product.description}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">{t("material")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              {product.material}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
