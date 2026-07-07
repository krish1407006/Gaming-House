import React, { useState, useEffect, useCallback, useRef } from "react";
import GameCard from "../components/GameCard";
import SkeletonCard from "../components/SkeletonCard";
import { Icon } from "../components/Icons";
import apiService from "../services/api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";


const PAGE_SIZE = 8;

const TOP_RATED_PARAMS = { page: 1, limit: PAGE_SIZE, sortBy: "averageRating", sortOrder: "desc" };

export default function TopRatedPage() {
  const cachedInitial = apiService.peekGames(TOP_RATED_PARAMS);
  const [games, setGames] = useState(cachedInitial?.games ?? []);
  const [loading, setLoading] = useState(!cachedInitial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [minRating, setMinRating] = useState(0);
  const fetchingRef = useRef(false);
  const fetchGames = useCallback(async (pageNum, minR) => {
    fetchingRef.current = true;
    const isInitial = pageNum === 1;
    if (isInitial) {
      const peekParams = { page: pageNum, limit: PAGE_SIZE, sortBy: "averageRating", sortOrder: "desc" };
      if (!apiService.peekGames(peekParams)) {
        setLoading(true);
      }
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const params = {
        page: pageNum,
        limit: PAGE_SIZE,
        sortBy: "averageRating",
        sortOrder: "desc",
      };
      const response = await apiService.getGames(params);
      const all = response?.games || [];

      const filtered = minR > 0
        ? all.filter((g) => (g.averageRating || 0) >= minR)
        : all;

      setGames((prev) => isInitial ? filtered : [...prev, ...filtered]);
      const pag = response?.pagination;
      if (pag) {
        setPage(pag.currentPage || 1);
        setHasMore(pag.hasNextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || "Failed to load top rated games");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchGames(1, minRating);
  }, [minRating, fetchGames]);

  const loadMore = useCallback(() => {
    if (!fetchingRef.current && hasMore) {
      fetchGames(page + 1, minRating);
    }
  }, [fetchGames, hasMore, page, minRating]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading: loading || loadingMore,
  });

  const handleRatingFilter = (value) => {
    const r = Number(value);
    setMinRating(r);
    setGames([]);
  };

  const bannerImg = games[0]?.poster || games[0]?.image || null;

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] relative h-48 sm:h-56 lg:h-64 flex items-center justify-center mb-6 lg:mb-8 bg-[var(--bg-secondary)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000cc] to-[#00000099] z-10"></div>
        {bannerImg && (
          <img
            src={bannerImg}
            alt="Banner"
            className="object-cover w-full h-full absolute top-0 left-0"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-2 tracking-wide text-[var(--accent-color)] drop-shadow-lg font-heading">
            <Icon name="star" size={20} className="inline lg:w-8 lg:h-8 mr-2" style={{ color: 'var(--accent-color)' }} />Top Rated Games
          </h2>
          <p className="text-white text-sm sm:text-base lg:text-xl drop-shadow-lg font-medium">
            The highest rated games according to our community
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 lg:mb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-[var(--accent-color)] tracking-wide font-heading">
          Highest Rated
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-xs lg:text-sm" style={{ color: 'var(--text-secondary)' }}>Rating filter:</label>
          <select
            value={minRating}
            onChange={(e) => handleRatingFilter(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm touch-target"
          >
            <option value={0}>All Ratings</option>
            <option value={7}>Good (7+)</option>
            <option value={8}>Excellent (8+)</option>
            <option value={8.5}>Outstanding (8.5+)</option>
            <option value={9}>Masterpieces (9+)</option>
          </select>
        </div>
      </div>

      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <SkeletonCard count={8} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-lg lg:text-xl font-bold px-4" style={{ color: 'var(--accent-color)' }}>
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <div className="text-4xl lg:text-6xl mb-3 lg:mb-4">
              <Icon name="star" size={48} className="lg:w-18 lg:h-18" style={{ color: 'var(--accent-color)' }} />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No High-Rated Games Found
            </h3>
            <p className="text-sm lg:text-base px-4" style={{ color: 'var(--text-secondary)' }}>
              No games meet the current rating criteria
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {games.map((game, idx) => {
                return (
                  <div key={game._id || game.gameId || `top-${idx}`} className="relative">
                    <div className="absolute -top-1 lg:-top-2 -left-1 lg:-left-2 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center font-bold text-xs lg:text-sm z-10">
                      #{idx + 1}
                    </div>
                    <GameCard game={game} />
                    <div className="mt-2 text-center">
                      <div className="flex justify-center items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                        <div className="flex items-center gap-1 text-[var(--accent-color)] font-semibold">
                          <Icon name="star" size={14} className="lg:w-4 lg:h-4 mr-1" style={{ color: 'var(--accent-color)' }} />{(game.averageRating || 0).toFixed(1)}/10
                        </div>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span className="truncate" style={{ color: 'var(--text-secondary)' }}>
                          {game.totalRatings > 0 ? `${game.totalRatings} reviews` : 'Community rated'}
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
              <div ref={sentinelRef} className="h-4" />
            )}
          </>
        )}
      </div>
    </section>
  );
}
