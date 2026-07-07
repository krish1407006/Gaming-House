export default function SkeletonCard({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="theme-bg-secondary rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-[3/4] bg-gray-700/40" />
          <div className="p-4 space-y-2.5">
            <div className="h-4 bg-gray-700/40 rounded w-3/4" />
            <div className="h-3 bg-gray-700/40 rounded w-1/2" />
            <div className="h-3 bg-gray-700/40 rounded w-full" />
            <div className="flex gap-2 pt-1">
              <div className="h-4 bg-gray-700/40 rounded w-12" />
              <div className="h-4 bg-gray-700/40 rounded w-10" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}