"use client";

import Link from "next/link";
import Image from "next/image";
import { CATEGORY_LABELS, type Product } from "@/types/product";

type Props = {
  product: Product;
};

const CATEGORY_BG: Record<string, string> = {
  tshirt: "bg-neutral-100",
  shirt: "bg-neutral-100",
  "phone-case": "bg-blue-50",
  earbuds: "bg-blue-50",
};

export function ProductCard({ product }: Props) {
  const bgClass = CATEGORY_BG[product.category] ?? "bg-neutral-100";
  const firstImage =
  product.images?.[0] && product.images[0].startsWith("http")
    ? product.images[0]
    : null;

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <article className="border border-border rounded-xl overflow-hidden bg-surface hover:border-border transition-colors duration-150 shadow-sm">
        {/* Image area */}
        <div
          className={`relative aspect-square w-full ${bgClass} flex items-center justify-center`}
        >
          {firstImage ? (
            <Image
              src={firstImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <span className="text-neutral-300 text-5xl select-none">
              {product.category === "tshirt" || product.category === "shirt"
                ? "👕"
                : product.category === "phone-case"
                ? "📱"
                : "🎧"}
            </span>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.is_customizable && (
              <span className="text-[10px] font-medium tracking-widest bg-[#0a0a0a] text-white px-2 py-0.5 rounded-full">
                CUSTOM
              </span>
            )}
            {product.is_new && !product.is_customizable && (
              <span className="text-[10px] font-medium tracking-widest bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">
                NEW
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 border-t border-neutral-150">
          <p className="text-[10px] uppercase tracking-[0.06em] text-muted font-medium mb-1">
            {CATEGORY_LABELS[product.category]}
          </p>
          <p className="text-[13px] font-medium text-foreground leading-snug mb-3">
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-foreground">
              Rs.{" "}
              {product.base_price.toLocaleString("en-NP")}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                // cart logic will go here
              }}
              className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-150"
              aria-label={`Add ${product.name} to cart`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
