"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  productName: string;
  fallbackEmoji: string;
};

export function ProductGallery({ images, productName, fallbackEmoji }: Props) {
  const [active, setActive] = useState(0);

  const hasImages = images && images.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full rounded-xl border border-neutral-150 bg-neutral-50 overflow-hidden">
        {hasImages ? (
          <Image
            src={images[active]}
            alt={`${productName} — image ${active + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-8xl select-none">{fallbackEmoji}</span>
          </div>
        )}
      </div>

      {/* Thumbnail strip — only if multiple images */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={[
                "relative flex-shrink-0 w-16 h-16 rounded-lg border overflow-hidden transition-all duration-150",
                i === active
                  ? "border-[#0a0a0a]"
                  : "border-neutral-150 opacity-60 hover:opacity-100 hover:border-neutral-300",
              ].join(" ")}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
