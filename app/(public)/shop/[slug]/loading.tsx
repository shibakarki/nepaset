export default function ProductDetailLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-10 bg-neutral-100 rounded animate-pulse" />
        <div className="h-3 w-2 bg-neutral-100 rounded animate-pulse" />
        <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse" />
        <div className="h-3 w-2 bg-neutral-100 rounded animate-pulse" />
        <div className="h-3 w-24 bg-neutral-100 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Gallery skeleton */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full bg-neutral-100 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-16 h-16 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="h-4 w-16 bg-neutral-100 rounded animate-pulse" />
            <div className="h-4 w-14 bg-neutral-100 rounded-full animate-pulse" />
          </div>
          <div className="h-9 w-3/4 bg-neutral-100 rounded-lg animate-pulse" />
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 w-16 bg-neutral-100 rounded-full animate-pulse" />
            ))}
          </div>
          <div className="border-t border-neutral-150 pt-6 space-y-4">
            <div className="h-8 w-32 bg-neutral-100 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-12 bg-neutral-100 rounded animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-10 bg-neutral-100 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            <div className="h-12 w-full bg-neutral-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
