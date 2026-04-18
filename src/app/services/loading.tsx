/**
 * Services Page Loading Skeleton
 *
 * @module app/services/loading
 */
export default function ServicesLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-[#01476b] to-[#013a56] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="h-4 w-32 shimmer rounded mb-4 opacity-20" />
          <div className="h-10 w-72 shimmer rounded mb-4 opacity-20" />
          <div className="h-5 w-96 shimmer rounded opacity-20" />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="h-48 shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 shimmer rounded" />
                <div className="h-4 w-full shimmer rounded" />
                <div className="h-4 w-5/6 shimmer rounded" />
                <div className="space-y-2 mt-3">
                  <div className="h-3 w-40 shimmer rounded" />
                  <div className="h-3 w-36 shimmer rounded" />
                  <div className="h-3 w-44 shimmer rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
