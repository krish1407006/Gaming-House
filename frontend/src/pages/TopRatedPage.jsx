import React, { useState } from "react";
import GameCard from "../components/GameCard";
import { Icon } from "../components/Icons";

export default function TopRatedPage({ allGames, loading, error }) {
  const [minRatings, setMinRatings] = useState(7.1); // Minimum rating threshold (default: show movies > 7)

  // Process movies for filtering and sorting - use useMemo to force re-computation when dependencies change
  const topRatedMovies = React.useMemo(() => {
    if (!allGames || !Array.isArray(allGames)) {
      return [];
    }

    return allGames
      .map((game) => {
        // Handle both backend and local data structures
        let avgRating, reviewCount;
        
        if (game.ratings && Array.isArray(game.ratings)) {
          // Backend data with ratings array
          if (game.ratings.length < 1) return null;
          avgRating = game.ratings.reduce((sum, r) => sum + r.rating, 0) / game.ratings.length;
          reviewCount = game.ratings.length;
        } else {
          // Local data or backend data with averageRating
          avgRating = game.averageRating || game.rating || 0;
          reviewCount = game.totalRatings || 0;
        }

        // Apply rating filter based on selected threshold
        if (avgRating < minRatings) return null;

        return { 
          ...game, 
          avgRating, 
          reviewCount,
          // Ensure we have the correct ID field
          id: game._id || game.movieId || game.id
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => {
        // Sort by average rating, then by number of reviews
        if (Math.abs(a.avgRating - b.avgRating) < 0.1) {
          return b.reviewCount - a.reviewCount;
        }
        return b.avgRating - a.avgRating;
      })
      .slice(0, 50); // Top 50
  }, [allGames, minRatings]); // Dependencies: re-compute when allGames or minRatings change

  const bannerImg = topRatedMovies[0]?.poster || topRatedMovies[0]?.image || null;

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl border-2 border-[var(--accent-color)] relative h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center mb-6 lg:mb-8">
        {bannerImg && (
          <img
            src={bannerImg}
            alt="Banner"
            className="object-cover w-full h-full opacity-60 absolute top-0 left-0"
          />
        )}
        <div className="relative z-10 text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 tracking-wide text-[var(--accent-color)] drop-shadow-lg">
            <Icon name="star" size={20} className="lg:w-6 lg:h-6 mr-2" style={{ color: 'var(--accent-color)' }} />Top Rated Gaming
          </h2>
          <p className="text-sm sm:text-base lg:text-lg drop-shadow" style={{ color: 'var(--text-primary)' }}>
            The highest rated game according to our community
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 lg:mb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-[var(--accent-color)] tracking-wide">
          Highest Rated ({topRatedMovies.length} game)
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-xs lg:text-sm" style={{ color: 'var(--text-secondary)' }}>Rating filter:</label>
          <select
            value={minRatings}
            onChange={(e) => setMinRatings(Number(e.target.value))}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm touch-target"
          >
            <option value={7.1}>Good (7+)</option>
            <option value={8}>Excellent (8+)</option>
            <option value={8.5}>Outstanding (8.5+)</option>
            <option value={9}>Masterpieces (9+)</option>
          </select>
        </div>
      </div>

      {/* Top Rated Movies Content Area */}
      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 lg:h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 border-[var(--accent-color)] mb-3 lg:mb-4"></div>
            <span className="text-lg lg:text-xl font-bold">Loading top rated gaming...</span>
            <span className="text-xs lg:text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Finding the highest rated content</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-lg lg:text-xl font-bold px-4" style={{ color: 'var(--accent-color)' }}>
            {error}
          </div>
        ) : topRatedMovies.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {topRatedMovies.map((game, idx) => (
              <div key={game.id || game._id || game.movieId || idx} className="relative">
                <div className="absolute -top-1 lg:-top-2 -left-1 lg:-left-2 bg-[var(--accent-color)] text-[var(--bg-primary)] rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center font-bold text-xs lg:text-sm z-10">
                  #{idx + 1}
                </div>
                <GameCard game={game} />
                <div className="mt-2 text-center">
                  <div className="flex justify-center items-center gap-1 lg:gap-2 text-xs lg:text-sm">
                    <div className="flex items-center gap-1 text-[var(--accent-color)] font-semibold">
                      <Icon name="star" size={14} className="lg:w-4 lg:h-4 mr-1" style={{ color: 'var(--accent-color)' }} />{game.avgRating?.toFixed(1)}/10
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span className="truncate" style={{ color: 'var(--text-secondary)' }}>
                      {game.reviewCount > 0 ? `${game.reviewCount} reviews` : 'Community rated'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
