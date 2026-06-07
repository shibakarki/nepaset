"use client";

import { useState } from "react";
import type { ProductVariant } from "@/types/product";

type Props = {
  variants: ProductVariant[];
  basePrice: number;
  onVariantChange?: (variant: ProductVariant | null) => void;
};

export function VariantSelector({ variants, basePrice, onVariantChange }: Props) {
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length === 1 ? sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length === 1 ? colors[0] : null
  );

  function getMatchingVariant(size: string | null, color: string | null) {
    return variants.find((v) => {
      const sizeMatch = sizes.length === 0 || v.size === size;
      const colorMatch = colors.length === 0 || v.color === color;
      return sizeMatch && colorMatch;
    }) ?? null;
  }

  function handleSize(size: string) {
    setSelectedSize(size);
    const variant = getMatchingVariant(size, selectedColor);
    onVariantChange?.(variant);
  }

  function handleColor(color: string) {
    setSelectedColor(color);
    const variant = getMatchingVariant(selectedSize, color);
    onVariantChange?.(variant);
  }

  const activeVariant = getMatchingVariant(selectedSize, selectedColor);
  const finalPrice = basePrice + (activeVariant?.price_delta ?? 0);
  const inStock = activeVariant ? activeVariant.stock > 0 : true;

  return (
    <div className="space-y-5">
      {/* Price — updates with variant */}
      <div className="flex items-baseline gap-2">
        <span className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight">
          Rs. {finalPrice.toLocaleString("en-NP")}
        </span>
        {activeVariant?.price_delta && activeVariant.price_delta > 0 && (
          <span className="text-xs text-neutral-400">
            +Rs. {activeVariant.price_delta.toLocaleString("en-NP")} for this option
          </span>
        )}
      </div>

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2.5">
            Size{" "}
            {selectedSize && (
              <span className="normal-case tracking-normal font-normal text-[#0a0a0a]">
                — {selectedSize}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const sizeVariant = getMatchingVariant(size, selectedColor);
              const outOfStock = sizeVariant ? sizeVariant.stock === 0 : false;
              return (
                <button
                  key={size}
                  onClick={() => !outOfStock && handleSize(size)}
                  disabled={outOfStock}
                  className={[
                    "min-w-[40px] px-3 py-1.5 text-xs font-medium border rounded-lg transition-all duration-150",
                    outOfStock
                      ? "border-neutral-150 text-neutral-300 cursor-not-allowed line-through"
                      : selectedSize === size
                      ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                      : "border-neutral-150 text-[#0a0a0a] hover:border-neutral-300",
                  ].join(" ")}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color selector */}
      {colors.length > 0 && (
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2.5">
            Color{" "}
            {selectedColor && (
              <span className="normal-case tracking-normal font-normal text-[#0a0a0a]">
                — {selectedColor}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const colorVariant = getMatchingVariant(selectedSize, color);
              const outOfStock = colorVariant ? colorVariant.stock === 0 : false;
              return (
                <button
                  key={color}
                  onClick={() => !outOfStock && handleColor(color)}
                  disabled={outOfStock}
                  className={[
                    "px-3 py-1.5 text-xs font-medium border rounded-lg transition-all duration-150",
                    outOfStock
                      ? "border-neutral-150 text-neutral-300 cursor-not-allowed line-through"
                      : selectedColor === color
                      ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                      : "border-neutral-150 text-[#0a0a0a] hover:border-neutral-300",
                  ].join(" ")}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock status */}
      {activeVariant && (
        <p className="text-xs text-neutral-400">
          {activeVariant.stock === 0
            ? "Out of stock"
            : activeVariant.stock <= 5
            ? `Only ${activeVariant.stock} left`
            : "In stock"}
        </p>
      )}

      {/* CTA */}
      <AddToCartButton
        variant={activeVariant}
        inStock={inStock}
        needsSize={sizes.length > 0 && !selectedSize}
        needsColor={colors.length > 0 && !selectedColor}
      />
    </div>
  );
}

function AddToCartButton({
  variant,
  inStock,
  needsSize,
  needsColor,
}: {
  variant: ProductVariant | null;
  inStock: boolean;
  needsSize: boolean;
  needsColor: boolean;
}) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!inStock || needsSize || needsColor) return;
    // cart logic will wire in here via useCart hook
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  let label = "Add to cart";
  if (!inStock) label = "Out of stock";
  else if (needsSize) label = "Select a size";
  else if (needsColor) label = "Select a color";
  else if (added) label = "Added ✓";

  return (
    <button
      onClick={handleAdd}
      disabled={!inStock || needsSize || needsColor}
      className={[
        "w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-150",
        !inStock
          ? "bg-neutral-100 text-neutral-300 cursor-not-allowed"
          : needsSize || needsColor
          ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
          : added
          ? "bg-neutral-800 text-white"
          : "bg-[#0a0a0a] text-white hover:bg-neutral-800 active:scale-[0.99]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
