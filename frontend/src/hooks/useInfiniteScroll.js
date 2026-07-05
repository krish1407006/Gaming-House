import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll({ onLoadMore, hasMore, loading, threshold = 300 }) {
  const sentinelRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, loading]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [handleIntersection, threshold]);

  return sentinelRef;
}
