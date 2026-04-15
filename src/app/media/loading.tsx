/**
 * Media Page Loading Skeleton
 *
 * @module app/media/loading
 */
export default function MediaLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header skeleton */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        <div className="h-4 w-24 shimmer rounded mb-4" />
        <div className="h-9 w-48 shimmer rounded mb-3" />
        <div className="h-5 w-80 shimmer rounded" />
      </div>

      {/* Video section skeleton */}
      <div className="bg-[#0a0a0a] py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Featured video player */}
          <div className="aspect-video w-full shimmer rounded-xl mb-8 opacity-30" />
          {/* Tab bar */}
          <div className="flex gap-4 mb-8">
            <div className="h-9 w-20 shimmer rounded-lg opacity-30" />
            <div className="h-9 w-24 shimmer rounded-lg opacity-30" />
            <div className="h-9 w-20 shimmer rounded-lg opacity-30" />
          </div>
          {/* Video grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-video shimmer rounded-lg opacity-30" />
                <div className="mt-2 h-4 w-3/4 shimmer rounded opacity-30" />
                <div className="mt-1 h-3 w-1/2 shimmer rounded opacity-30" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery section skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-8 w-40 shimmer rounded mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="row-span-2 col-span-2 aspect-square shimmer rounded-xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square shimmer rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
