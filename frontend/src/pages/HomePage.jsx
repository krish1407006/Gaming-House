import React, { useState, useEffect, useCallback, useRef } from "react";
import GameCard from "../components/GameCard";
import SkeletonCard from "../components/SkeletonCard";
import apiService from "../services/api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { discoveryBackgrounds } from "../constants/backgroundImages";
import SlowLoadNotice from "../components/SlowLoadNotice";
import { useSlowLoadNotice } from "../hooks/useSlowLoadNotice";

const PAGE_SIZE = 8;

export default function HomePage() {
  const cachedInitial = apiService.peekHomepage(1, PAGE_SIZE);
  const [games, setGames] = useState(cachedInitial?.games ?? []);
  const [loading, setLoading] = useState(!cachedInitial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const fetchingRef = useRef(false);
  const showSlowNotice = useSlowLoadNotice(loading);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentBgIndex((prev) =>
        prev === discoveryBackgrounds.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const fetchGames = useCallback(async (pageNum) => {
    fetchingRef.current = true;
    const isInitial = pageNum === 1;
    if (isInitial) {
      if (!apiService.peekHomepage(pageNum, PAGE_SIZE)) {
        setLoading(true);
      }
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await apiService.getHomepage(pageNum, PAGE_SIZE);
      const newGames = response?.games || [];
      const pagination = response?.pagination;

      setGames((prev) => isInitial ? newGames : [...prev, ...newGames]);

      if (pagination) {
        setPage(pagination.currentPage || 1);
        setHasMore(pagination.currentPage < pagination.totalPages);
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
    fetchGames(1);
  }, [fetchGames]);

  const loadMore = useCallback(() => {
    if (!fetchingRef.current && hasMore) {
      fetchGames(page + 1);
    }
  }, [fetchGames, hasMore, page]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading: loading || loadingMore,
  });

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] relative h-48 sm:h-64 lg:h-72 flex items-center justify-center mb-6 lg:mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000cc] to-[#00000099] z-10"></div>

        {discoveryBackgrounds.map((bg, index) => (
          <img
            key={bg.url}
            src={bg.url}
            alt={bg.credit}
            className={`object-cover w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBgIndex ? "opacity-80" : "opacity-0"
            }`}
            style={{ objectPosition: bg.position }}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index === 0 ? "high" : "low"}
          />
        ))}

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-3 lg:mb-4 tracking-wide animate-fade-in font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-color)] to-[#a3a3a3]">
              Discover Amazing Games
            </span>
          </h2>
          <p className="text-white text-sm sm:text-base lg:text-xl drop-shadow-lg font-medium animate-fade-in-up">
            Experience the best ratings and reviews from the Gaming House community.
          </p>

          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--accent-color)] opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-2xl font-bold text-[var(--accent-color)] tracking-wide font-heading">
          Home
        </h3>
      </div>

      <div className="min-h-[300px] lg:min-h-[400px] relative">
        <SlowLoadNotice show={showSlowNotice} />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <SkeletonCard count={8} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-lg lg:text-xl font-bold px-4" style={{ color: 'var(--accent-color)' }}>
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="text-gray-400 text-base lg:text-lg px-4">
            No games found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {games.map((game, idx) => (
                <GameCard key={game._id || game.gameId || `game-${idx}`} game={game} priority={idx < 3} />
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
