import React, { useState, useMemo } from "react";
import MovieCard from "../components/MovieCard";
import { Icon } from "../components/Icons";

export default function CategoriesPage({ allMovies, loading, error }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const movies = Array.isArray(allMovies) ? allMovies : [];

  const categories = useMemo(() => {
    const cats = new Set();
    movies.forEach((m) => {
      const genre = m.category || m.genre?.[0] || "Unknown";
      cats.add(genre);
    });
    return Array.from(cats).sort();
  }, [movies]);

  const filteredMovies = activeCategory
    ? movies.filter((m) => (m.category || m.genre?.[0]) === activeCategory)
    : movies;

  const categoryCounts = useMemo(() => {
    const counts = {};
    movies.forEach((m) => {
      const cat = m.category || m.genre?.[0] || "Unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [movies]);

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl border-2 border-[var(--accent-color)] relative h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center mb-6 lg:mb-8">
        <div className="relative z-10 text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 tracking-wide text-[var(--accent-color)] drop-shadow-lg">
            <Icon name="grid" size={20} className="lg:w-6 lg:h-6 mr-2" />Categories
          </h2>
          <p className="text-sm sm:text-base lg:text-lg drop-shadow" style={{ color: 'var(--text-primary)' }}>
            Browse games by genre and category
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory(null)}
          className={`font-semibold px-4 py-2 text-sm rounded-lg transition-colors ${
            !activeCategory
              ? "bg-[var(--accent-color)] text-[var(--bg-primary)]"
              : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]"
          }`}
        >
          All ({movies.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`font-semibold px-4 py-2 text-sm rounded-lg transition-colors ${
              activeCategory === cat
                ? "bg-[var(--accent-color)] text-[var(--bg-primary)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]"
            }`}
          >
            {cat} ({categoryCounts[cat] || 0})
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
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl lg:text-6xl mb-4">🎮</div>
            <h3 className="text-xl lg:text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No games found in this category
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredMovies.map((movie, idx) => (
              <MovieCard key={movie._id || movie.movieId || movie.id || idx} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
