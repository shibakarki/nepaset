"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[shop/slug] error:", error);
  }, [error]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-400"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[#0a0a0a] mb-1">
          Could not load product
        </p>
        <p className="text-xs text-neutral-400 mb-6">
          Something went wrong fetching this product.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="text-xs font-medium px-4 py-2 bg-[#0a0a0a] text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/shop"
            className="text-xs font-medium px-4 py-2 border border-neutral-150 rounded-lg hover:border-neutral-300 transition-colors"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </main>
  );
}
