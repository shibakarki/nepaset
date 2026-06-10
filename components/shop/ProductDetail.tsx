"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useCart } from "@/hooks/useCart";
import { CATEGORY_LABELS, type Product, type ProductVariant } from "@/types/product";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /^https?:\/\//i.test(url.trim()) || url.startsWith("/");
}

function getFallbackEmoji(category: string) {
  if (category === "tshirt" || category === "shirt") return "👕";
  if (category === "phone-case") return "📱";
  return "🎧";
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  product: Product;
  variants: ProductVariant[];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImageGallery({
  images,
  productName,
  category,
}: {
  images: string[];
  productName: string;
  category: string;
}) {
  const validImages = images.filter(isValidUrl);
  const [active, setActive] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());

  const handleError = useCallback((idx: number) => {
    setErrors((prev) => new Set(prev).add(idx));
  }, []);

  const activeValid = validImages.length > 0 && !errors.has(active);
  const fallback = getFallbackEmoji(category);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center">
        {activeValid ? (
          <Image
            key={validImages[active]}
            src={validImages[active]}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            onError={() => handleError(active)}
          />
        ) : (
          <span className="text-neutral-300 text-7xl select-none">{fallback}</span>
        )}
      </div>

      {/* Thumbnails — only if more than 1 valid image */}
      {validImages.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {validImages.map((src, idx) => {
            const hasError = errors.has(idx);
            const isActive = idx === active;

            return (
              <button
                key={src}
                onClick={() => setActive(idx)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 border-2 transition-all duration-150 ${
                  isActive
                    ? "border-foreground"
                    : "border-transparent hover:border-border"
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                {!hasError ? (
                  <Image
                    src={src}
                    alt={`${productName} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    onError={() => handleError(idx)}
                  />
                ) : (
                  <span className="text-neutral-300 text-xl flex items-center justify-center w-full h-full">
                    {fallback}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Variant selectors ────────────────────────────────────────────────────────

function SizeSelector({
  sizes,
  selected,
  onSelect,
  variants,
  selectedColor,
}: {
  sizes: string[];
  selected: string | null;
  onSelect: (s: string) => void;
  variants: ProductVariant[];
  selectedColor: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-inter text-xs font-medium text-neutral-500 uppercase tracking-widest">
        Size
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const variant = variants.find(
            (v) =>
              v.size === size &&
              (selectedColor === null || v.color === selectedColor)
          );
          const outOfStock = variant ? variant.stock === 0 : false;
          const isSelected = selected === size;

          return (
            <button
              key={size}
              onClick={() => !outOfStock && onSelect(size)}
              disabled={outOfStock}
              className={`min-w-[2.5rem] h-9 px-3 rounded-lg border font-inter text-sm transition-all duration-150 ${
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : outOfStock
                  ? "border-border text-muted line-through cursor-not-allowed"
                  : "border-border text-foreground hover:border-foreground"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorSelector({
  colors,
  selected,
  onSelect,
  variants,
  selectedSize,
}: {
  colors: string[];
  selected: string | null;
  onSelect: (c: string) => void;
  variants: ProductVariant[];
  selectedSize: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-inter text-xs font-medium text-neutral-500 uppercase tracking-widest">
        Color
        {selected && (
          <span className="ml-2 normal-case tracking-normal text-foreground">
            — {selected}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const variant = variants.find(
            (v) =>
              v.color === color &&
              (selectedSize === null || v.size === selectedSize)
          );
          const outOfStock = variant ? variant.stock === 0 : false;
          const isSelected = selected === color;

          return (
            <button
              key={color}
              onClick={() => !outOfStock && onSelect(color)}
              disabled={outOfStock}
              title={color}
              className={`w-9 h-9 rounded-full border-2 font-inter text-[10px] font-medium transition-all duration-150 relative overflow-hidden ${
                isSelected
                  ? "border-foreground scale-110"
                  : outOfStock
                  ? "border-border opacity-40 cursor-not-allowed"
                  : "border-border hover:border-muted"
              }`}
              style={{
                backgroundColor: isValidCssColor(color)
                  ? color
                  : undefined,
              }}
            >
              {!isValidCssColor(color) && (
                <span className="text-[9px] leading-none px-0.5">
                  {color.slice(0, 3)}
                </span>
              )}
              {outOfStock && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="block w-full h-px bg-neutral-400 rotate-45" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Rough check — CSS named colors and hex values render nicely as background-color */
function isValidCssColor(str: string) {
  return /^#[0-9a-f]{3,6}$/i.test(str) || /^[a-z]+$/i.test(str);
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductDetail({ product, variants }: Props) {
  const { addItem, openCart } = useCart();

  // Derive unique sizes and colors from variants
  const sizes = Array.from(
    new Set(variants.map((v) => v.size).filter(Boolean) as string[])
  );
  const colors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean) as string[])
  );

  const hasVariants = variants.length > 0;
  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null
  );
  const [added, setAdded] = useState(false);

  // Find the matching variant
  const matchedVariant = hasVariants
    ? variants.find((v) => {
        const sizeMatch = !hasSizes || v.size === selectedSize;
        const colorMatch = !hasColors || v.color === selectedColor;
        return sizeMatch && colorMatch;
      }) ?? null
    : null;

  const unitPrice = product.base_price + (matchedVariant?.price_delta ?? 0);

  // Determine if add-to-cart is possible
  const needsSize = hasSizes && !selectedSize;
  const needsColor = hasColors && !selectedColor;
  const isOutOfStock =
    hasVariants && matchedVariant !== null && matchedVariant.stock === 0;
  const noVariantSelected = needsSize || needsColor;
  const canAdd = !noVariantSelected && !isOutOfStock;

  // Stock display
  const stock = matchedVariant?.stock ?? (hasVariants ? null : 999);
  const lowStock = stock !== null && stock > 0 && stock <= 5;

  function handleAddToCart() {
    if (!canAdd) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images?.[0] ?? null,
      variant: matchedVariant,
      unitPrice,
      maxStock: stock ?? 999,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const buttonLabel = added
    ? "Added!"
    : isOutOfStock
    ? "Out of stock"
    : needsSize
    ? "Select a size"
    : needsColor
    ? "Select a color"
    : `Add to cart — Rs. ${unitPrice.toLocaleString("en-NP")}`;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted mb-8 font-inter">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-foreground transition-colors"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[140px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Left: Gallery ── */}
        <ImageGallery
          images={product.images ?? []}
          productName={product.name}
          category={product.category}
        />

        {/* ── Right: Info ── */}
        <div className="flex flex-col gap-5 lg:py-2">
          {/* Category + badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 font-inter">
              {CATEGORY_LABELS[product.category]}
            </span>
            {product.is_customizable && (
              <span className="text-[10px] font-medium tracking-widest bg-foreground text-background px-2 py-0.5 rounded-full font-inter">
                CUSTOM
              </span>
            )}
            {product.is_new && (
              <span className="text-[10px] font-medium tracking-widest bg-surface-2 text-foreground px-2 py-0.5 rounded-full font-inter">
                NEW
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="font-space text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-space text-2xl font-semibold text-foreground">
              Rs. {unitPrice.toLocaleString("en-NP")}
            </span>
            {matchedVariant && matchedVariant.price_delta !== 0 && (
              <span className="font-inter text-xs text-neutral-400">
                (base Rs. {product.base_price.toLocaleString("en-NP")})
              </span>
            )}
          </div>

          <div className="h-px bg-neutral-150 w-full" />

          {/* Variants */}
          {hasVariants ? (
            <div className="flex flex-col gap-5">
              {hasSizes && (
                <SizeSelector
                  sizes={sizes}
                  selected={selectedSize}
                  onSelect={setSelectedSize}
                  variants={variants}
                  selectedColor={selectedColor}
                />
              )}
              {hasColors && (
                <ColorSelector
                  colors={colors}
                  selected={selectedColor}
                  onSelect={setSelectedColor}
                  variants={variants}
                  selectedSize={selectedSize}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-inter text-xs text-neutral-400 uppercase tracking-widest">
                Availability
              </span>
              <span className="font-inter text-xs font-medium text-foreground">
                In stock
              </span>
            </div>
          )}

          {/* Stock warning */}
          {lowStock && (
            <p className="font-inter text-xs text-amber-600 font-medium">
              Only {stock} left in stock
            </p>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!canAdd || added}
            className={`w-full h-12 rounded-xl font-space text-sm font-semibold transition-all duration-200 mt-2 ${
              added
                ? "bg-foreground text-background scale-[0.99]"
                : isOutOfStock
                ? "bg-surface-2 text-muted cursor-not-allowed"
                : noVariantSelected
                ? "bg-surface-2 text-muted cursor-not-allowed"
                : "bg-foreground text-background hover:opacity-90 active:scale-[0.98]"
            }`}
          >
            {buttonLabel}
          </button>

          {/* View cart link — shows after adding */}
          {added && (
            <button
              onClick={openCart}
              className="font-inter text-xs text-center text-muted hover:text-foreground transition-colors -mt-2"
            >
              View cart →
            </button>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <>
              <div className="h-px bg-neutral-150 w-full" />
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-inter text-[11px] text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}