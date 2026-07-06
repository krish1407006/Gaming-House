import React, { useState, useEffect, useCallback, useRef } from "react";
import GameCard from "../components/GameCard";
import SkeletonCard from "../components/SkeletonCard";
import { Icon } from "../components/Icons";
import apiService from "../services/api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

const PAGE_SIZE = 20;

const GENRES = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
  "Music", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western",
];

export default function CategoriesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeGenre, setActiveGenre] = useState(null);
  const fetchingRef = useRef(false);

  const fetchGames = useCallback(async (pageNum, genre) => {
    fetchingRef.current = true;
    const isInitial = pageNum === 1;
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const params = { page: pageNum, limit: PAGE_SIZE };
      if (genre) params.genre = genre;
      const response = await apiService.getGames(params);
      const newGames = response?.games || [];

      setGames((prev) => isInitial ? newGames : [...prev, ...newGames]);
      const pag = response?.pagination;
      if (pag) {
        setPage(pag.currentPage || 1);
        setHasMore(pag.hasNextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || "Failed to load games");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchGames(1, activeGenre);
  }, [activeGenre, fetchGames]);

  const handleGenreChange = (genre) => {
    const next = genre === activeGenre ? null : genre;
    setActiveGenre(next);
    setGames([]);
  };

  const loadMore = useCallback(() => {
    if (!fetchingRef.current && hasMore) {
      fetchGames(page + 1, activeGenre);
    }
  }, [fetchGames, hasMore, page, activeGenre]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading: loading || loadingMore,
  });

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] relative h-48 sm:h-56 lg:h-64 flex items-center justify-center mb-6 lg:mb-8 bg-[#000000]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#000000] z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #667eea, transparent)' }}></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #764ba2, transparent)' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.02]" style={{ background: 'radial-gradient(circle, #fff, transparent)' }}></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 tracking-wide font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#667eea] bg-[length:200%_auto] animate-[shimmer_3s_ease-in-out_infinite]">
              <Icon name="grid" size={24} className="inline lg:w-8 lg:h-8 mr-2" style={{ color: '#667eea' }} />Categories
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg drop-shadow-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
            Browse games by genre and category
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleGenreChange(null)}
          className={`font-semibold px-4 py-2 text-sm rounded-lg transition-all ${
            !activeGenre
              ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-[#667eea]/20"
              : "bg-[#000000] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[#667eea] hover:text-white"
          }`}
        >
          All
        </button>
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreChange(genre)}
            className={`font-semibold px-4 py-2 text-sm rounded-lg transition-all ${
              activeGenre === genre
                ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-[#667eea]/20"
                : "bg-[#000000] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[#667eea] hover:text-white"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <SkeletonCard count={6} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-lg lg:text-xl font-bold px-4" style={{ color: 'var(--accent-color)' }}>
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl lg:text-6xl mb-4">🎮</div>
            <h3 className="text-xl lg:text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No games found in this category
            </h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {games.map((game, idx) => (
                <GameCard key={game._id || game.gameId || `cat-${idx}`} game={game} />
              ))}
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
