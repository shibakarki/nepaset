"use client";

import { useEffect } from "react";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[shop] page error:", error);
  }, [error]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          Something went wrong
        </p>
        <p className="text-xs text-neutral-400 mb-6">
          We couldn&apos;t load the products. Please try again.
        </p>
        <button
          onClick={reset}
          className="text-xs font-medium px-4 py-2 border border-neutral-150 rounded-lg hover:border-neutral-300 transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
