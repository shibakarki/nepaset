export default function ProductLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3.5 w-10 rounded bg-neutral-100 animate-pulse" />
        <div className="h-3.5 w-3 rounded bg-neutral-100 animate-pulse" />
        <div className="h-3.5 w-14 rounded bg-neutral-100 animate-pulse" />
        <div className="h-3.5 w-3 rounded bg-neutral-100 animate-pulse" />
        <div className="h-3.5 w-32 rounded bg-neutral-100 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery skeleton */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full rounded-2xl bg-neutral-100 animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-xl bg-neutral-100 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="flex flex-col gap-5 py-2">
          <div className="h-3 w-20 rounded bg-neutral-100 animate-pulse" />
          <div className="h-8 w-3/4 rounded bg-neutral-100 animate-pulse" />
          <div className="h-6 w-24 rounded bg-neutral-100 animate-pulse" />

          <div className="h-px w-full bg-neutral-100" />

          <div className="flex flex-col gap-2">
            <div className="h-3.5 w-16 rounded bg-neutral-100 animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-9 w-14 rounded-lg bg-neutral-100 animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="h-3.5 w-12 rounded bg-neutral-100 animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full bg-neutral-100 animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="h-12 w-full rounded-xl bg-neutral-100 animate-pulse mt-4" />
        </div>
      </div>
    </main>
  );
}
