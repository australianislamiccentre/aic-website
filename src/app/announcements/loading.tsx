/**
 * Announcements Page Loading Skeleton
 *
 * @module app/announcements/loading
 */
export default function AnnouncementsLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-[#01476b] to-[#013a56] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="h-4 w-32 shimmer rounded mb-4 opacity-20" />
          <div className="h-10 w-64 shimmer rounded mb-4 opacity-20" />
          <div className="h-5 w-96 shimmer rounded opacity-20" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3">
          <div className="h-10 w-64 shimmer rounded-xl" />
          <div className="h-10 w-20 shimmer rounded-full" />
          <div className="h-10 w-24 shimmer rounded-full" />
          <div className="h-10 w-20 shimmer rounded-full" />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="h-40 shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 shimmer rounded" />
                <div className="h-4 w-full shimmer rounded" />
                <div className="h-4 w-2/3 shimmer rounded" />
                <div className="h-3 w-24 shimmer rounded mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
