import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-6">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-400"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <h1 className="font-space text-xl font-semibold text-[#0a0a0a] mb-2">
        Product not found
      </h1>
      <p className="font-inter text-sm text-neutral-400 mb-8 max-w-xs">
        This product doesn't exist or may have been removed.
      </p>
      <Link
        href="/shop"
        className="font-space text-sm font-semibold bg-[#0a0a0a] text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all"
      >
        Back to shop
      </Link>
    </main>
  );
}
