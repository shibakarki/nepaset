export default function ShopLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-24 bg-neutral-100 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse" />
      </div>

      {/* Filter skeleton */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-neutral-100 animate-pulse"
          />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border border-neutral-150 rounded-xl overflow-hidden"
          >
            <div className="aspect-square w-full bg-neutral-100 animate-pulse" />
            <div className="p-3 border-t border-neutral-150">
              <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-28 bg-neutral-100 rounded animate-pulse mb-3" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 bg-neutral-100 rounded animate-pulse" />
                <div className="h-7 w-7 rounded-full bg-neutral-100 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
