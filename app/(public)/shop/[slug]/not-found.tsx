import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-space text-5xl font-medium text-neutral-150 mb-6 select-none">
          404
        </p>
        <p className="text-sm font-medium text-[#0a0a0a] mb-1">
          Product not found
        </p>
        <p className="text-xs text-neutral-400 mb-6">
          This product doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/shop"
          className="text-xs font-medium px-4 py-2 bg-[#0a0a0a] text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Browse all products
        </Link>
      </div>
    </main>
  );
}
