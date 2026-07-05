import { useEffect, useRef } from 'react';

export function useInfiniteScroll({ onLoadMore, hasMore, loading, threshold = 300 }) {
  const sentinelRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onLoadMoreRef.current();
      }
    }, { rootMargin: `${threshold}px` });

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, threshold]);

  return sentinelRef;
}
