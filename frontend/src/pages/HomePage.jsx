import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import { discoveryBackgrounds } from "../constants/backgroundImages";

export default function HomePage({ allMovies, loading, error }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Background image rotation effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBgIndex((prevIndex) => 
        prevIndex === discoveryBackgrounds.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000); // Change background every 5 seconds

    return () => clearInterval(intervalId);
  }, []);
  
  // Safety check for allMovies
  const movies = Array.isArray(allMovies) ? allMovies : [];
  
  let filteredMovies = movies;
  if (activeCategory) {
    filteredMovies = filteredMovies.filter((m) => m.category === activeCategory);
  }

  const categories = Array.from(new Set(movies.map((m) => m.category || m.genre?.[0] || 'Unknown')));
  const bannerImg = movies[0]?.image || movies[0]?.poster || "";
  const bannerTitle = "Discover Amazing Games ";
  const bannerDesc = "Experience the best ratings and reviews from the Gaming House community.";

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border-2 border-[var(--accent-color)] relative h-48 sm:h-64 lg:h-72 flex items-center justify-center mb-6 lg:mb-8">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000cc] to-[#00000099] z-10"></div>
        
        {/* Dynamic background image with fade transition */}
        {discoveryBackgrounds.map((bg, index) => (
          <img
            key={bg.url}
            src={bg.url}
            alt={bg.credit}
            className={`object-cover w-full h-full absolute top-0 left-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBgIndex ? 'opacity-80' : 'opacity-0'
            }`}
            style={{
              objectPosition: bg.position
            }}
          />
        ))}

        {/* Content overlay with animations */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-3 lg:mb-4 tracking-wide animate-fade-in">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-color)] to-purple-300">
              {bannerTitle}
            </span>
          </h2>
          <p className="text-white text-sm sm:text-base lg:text-xl drop-shadow-lg font-medium animate-fade-in-up">
            {bannerDesc}
          </p>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--accent-color)] opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-300 opacity-10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl lg:text-2xl font-bold text-[var(--accent-color)] tracking-wide">Home</h3>
      </div>

      {/* <div className="flex flex-wrap gap-2 mb-4 lg:mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={
              `font-semibold px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base text-center shadow rounded border transition-colors ` +
              (activeCategory === cat
                ? "bg-[var(--accent-color)] text-[var(--bg-primary)] border-[var(--accent-color)]"
                : "bg-[var(--bg-secondary)] text-[var(--accent-color)] border-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)]")
            }
          >
            {cat}
          </button>
        ))}
      </div> */}

  {/* Gaming Content Area */}
      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-72 lg:h-96 text-[var(--accent-color)]">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 border-[var(--accent-color)] mb-4"></div>
            <span className="text-lg lg:text-xl font-bold">Loading games...</span>
            <span className="text-xs lg:text-sm text-gray-400 mt-2 text-center px-4">Discovering amazing content for you</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-lg lg:text-xl font-bold px-4" style={{ color: 'var(--accent-color)' }}>
            {error}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-gray-400 text-base lg:text-lg px-4">
            No games found for this page.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredMovies.map((movie, idx) => (
              <MovieCard key={idx} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}