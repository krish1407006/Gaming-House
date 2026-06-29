import React, { useState, useEffect } from "react";
import GameCard from "../components/GameCard";
import Pagination from "../components/Pagination";
import { Icon } from "../components/Icons";
import apiService from "../services/api";

const PAGE_SIZE = 20;

export default function TopRatedPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [minRating, setMinRating] = useState(0);

  const fetchGames = async (page, minR) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        sortBy: "averageRating",
        sortOrder: "desc",
      };
      const response = await apiService.getGames(params);
      const all = response?.games || [];

      const filtered = minR > 0
        ? all.filter((g) => (g.averageRating || 0) >= minR)
        : all;

      setGames(filtered);
      const pag = response?.pagination;
      if (pag) {
        setTotalPages(pag.totalPages || 1);
        setCurrentPage(pag.currentPage || 1);
      }
    } catch (err) {
      setError(err.message || "Failed to load top rated games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(1, minRating);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchGames(page, minRating);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRatingFilter = (value) => {
    const r = Number(value);
    setMinRating(r);
    fetchGames(1, r);
  };

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl border-2 border-[var(--accent-color)] relative h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center mb-6 lg:mb-8">
        <div className="relative z-10 text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 tracking-wide text-[var(--accent-color)] drop-shadow-lg font-heading">
            <Icon name="star" size={20} className="lg:w-6 lg:h-6 mr-2" style={{ color: 'var(--accent-color)' }} />Top Rated Games
          </h2>
          <p className="text-sm sm:text-base lg:text-lg drop-shadow" style={{ color: 'var(--text-primary)' }}>
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
          <div className="flex flex-col items-center justify-center h-64 lg:h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 border-[var(--accent-color)] mb-3 lg:mb-4"></div>
            <span className="text-lg lg:text-xl font-bold">Loading top rated games...</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {games.map((game, idx) => {
                const rank = (currentPage - 1) * PAGE_SIZE + idx + 1;
                return (
                  <div key={game._id || game.gameId || `top-${idx}`} className="relative">
                    <div className="absolute -top-1 lg:-top-2 -left-1 lg:-left-2 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center font-bold text-xs lg:text-sm z-10">
                      #{rank}
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </section>
  );
}
