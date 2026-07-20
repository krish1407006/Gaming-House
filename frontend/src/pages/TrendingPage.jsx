import React, { useState, useEffect, useCallback, useRef } from "react";
import GameCard from "../components/GameCard";
import SkeletonCard from "../components/SkeletonCard";
import { Icon } from "../components/Icons";
import apiService from "../services/api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { dedupeGamesById } from "../utils/dedupeGames";
import { getGameImageUrl } from "../utils/imageUrl";

const PAGE_SIZE = 12;

export default function TrendingPage() {
  const cachedInitial = apiService.peekTrending({ page: 1, limit: PAGE_SIZE });
  const [trendinggames, setTrendinggames] = useState(cachedInitial?.games ?? []);
  const [loading, setLoading] = useState(!cachedInitial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const fetchingRef = useRef(false);

  const fetchTrending = useCallback(async (pageNum) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    const isInitial = pageNum === 1;
    if (isInitial) {
      if (!apiService.peekTrending({ page: pageNum, limit: PAGE_SIZE })) {
        setLoading(true);
      }
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const data = await apiService.getTrending({ page: pageNum, limit: PAGE_SIZE });
      const newGames = data?.games || [];
      const pagination = data?.pagination;

      setTrendinggames((prev) =>
        dedupeGamesById(isInitial ? newGames : [...prev, ...newGames])
      );

      if (pagination) {
        setPage(pagination.currentPage || pageNum);
        setHasMore(
          pagination.hasNextPage ??
            (pagination.currentPage < pagination.totalPages)
        );
      } else {
        setHasMore(newGames.length >= PAGE_SIZE);
      }
    } catch (err) {
      console.error("Error fetching trending games:", err);
      setError("Failed to load trending games");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchTrending(1);
  }, [fetchTrending]);

  useEffect(() => {
    const handleCacheRefresh = (event) => {
      const cacheKey = event?.detail?.cacheKey;
      if (cacheKey && !cacheKey.startsWith("trending_")) return;
      fetchTrending(1);
    };

    const handleStorage = (event) => {
      if (event.key === "gh_cache_invalidated_at") {
        fetchTrending(1);
      }
    };

    window.addEventListener("gh:cache-cleared", handleCacheRefresh);
    window.addEventListener("gh:cache-updated", handleCacheRefresh);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("gh:cache-cleared", handleCacheRefresh);
      window.removeEventListener("gh:cache-updated", handleCacheRefresh);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchTrending]);

  const loadMore = useCallback(() => {
    if (!fetchingRef.current && hasMore) {
      fetchTrending(page + 1);
    }
  }, [fetchTrending, hasMore, page]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading: loading || loadingMore,
  });

  const bannerImg = trendinggames[0] ? getGameImageUrl(trendinggames[0]) : null;

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl border border-[var(--border-color)] relative h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center mb-6 lg:mb-8">
        {bannerImg && (
          <img
            src={bannerImg}
            alt="Banner"
            className="object-cover w-full h-full opacity-60 absolute top-0 left-0"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="relative z-10 text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 tracking-wide text-[var(--accent-color)] drop-shadow-lg font-heading">
            What's Hot Right Now
          </h2>
          <p className="text-gray-200 text-sm sm:text-base lg:text-lg drop-shadow">
            Discover the most popular and highest-rated gaming right now
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-[var(--accent-color)] tracking-wide font-heading">
          Trending Now ({trendinggames.length} games)
        </h3>
      </div>

      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <SkeletonCard count={PAGE_SIZE} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-lg lg:text-xl font-bold px-4" style={{ color: 'var(--accent-color)' }}>
            {error}
          </div>
        ) : trendinggames.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">
              🔥
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Trending Gaming Found
            </h3>
            <p className="text-sm lg:text-base px-4" style={{ color: 'var(--text-secondary)' }}>
              Check back later for trending content
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {trendinggames.map((game, idx) => {
                const avgRating = game.averageRating || game.rating || 0;
                const reviewCount = game.totalRatings || 0;
                return (
                  <div key={game._id || game.gameId || game.id || idx} className="relative">
                    <div className="absolute -top-1 lg:-top-2 -left-1 lg:-left-2 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center font-bold text-xs lg:text-sm z-10">
                      #{idx + 1}
                    </div>
                    <GameCard game={game} />
                    <div className="mt-2 text-center">
                      <div className="flex justify-center items-center gap-1 lg:gap-2 text-xs lg:text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1">
                          <Icon name="star" size={14} className="lg:w-4 lg:h-4 mr-1" style={{ color: 'var(--accent-color)' }} />{reviewCount > 0 ? avgRating.toFixed(1) : 'N/A'}
                        </span>
                        <span>•</span>
                        <span className="truncate">
                          {reviewCount > 0 ? `${reviewCount} reviews` : 'Trending'}
                          {game.trending && ' 🔥'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-[var(--accent-color)]"></div>
              </div>
            )}

            {hasMore && !loadingMore && (
              <div ref={sentinelRef} className="h-4" aria-hidden="true" />
            )}

            {!hasMore && trendinggames.length > 0 && (
              <p className="text-center text-sm theme-text-secondary py-6">
                You&apos;ve reached the end
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
