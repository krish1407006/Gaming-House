import React, { useState, useEffect, useCallback, useRef } from "react";
import GameCard from "../components/GameCard";
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
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl border border-[var(--border-color)] relative h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center mb-6 lg:mb-8">
        <div className="relative z-10 text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 tracking-wide text-[var(--accent-color)] drop-shadow-lg font-heading">
            <Icon name="grid" size={20} className="lg:w-6 lg:h-6 mr-2" />Categories
          </h2>
          <p className="text-sm sm:text-base lg:text-lg drop-shadow" style={{ color: 'var(--text-primary)' }}>
            Browse games by genre and category
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleGenreChange(null)}
          className={`font-semibold px-4 py-2 text-sm rounded-lg transition-colors ${
            !activeGenre
              ? "bg-[var(--accent-color)] text-[var(--bg-primary)]"
              : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]"
          }`}
        >
          All
        </button>
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreChange(genre)}
            className={`font-semibold px-4 py-2 text-sm rounded-lg transition-colors ${
              activeGenre === genre
                ? "bg-[var(--accent-color)] text-[var(--bg-primary)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 lg:h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 border-[var(--accent-color)] mb-3 lg:mb-4"></div>
            <span className="text-lg lg:text-xl font-bold">Loading games...</span>
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
