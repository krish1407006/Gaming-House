import React, { useState, useMemo } from "react";
import MovieCard from "../components/MovieCard";
import { GenreIcon } from "../components/Icons";

export default function CategoriesPage({ allMovies, loading, error }) {
  const [selectedGenre, setSelectedGenre] = useState("all");

  // Process movies and extract genres
  const { movies, genres } = useMemo(() => {
    if (!allMovies || !Array.isArray(allMovies)) {
      console.log("[Categories] allMovies is not an array:", typeof allMovies, allMovies);
      return { movies: [], genres: [] };
    }
    
    console.log("[Categories] Processing movies:", allMovies.length, "movies");
    
    // Process the movies (backend format)
    const processedMovies = allMovies.map((movie) => ({
      ...movie,
      // Ensure consistent field names for both frontend and backend
      title: movie.title || movie.name,
      name: movie.name || movie.title,
      // Backend uses genre array, local data uses category string
      genre: movie.genre || (movie.category ? [movie.category] : []),
      category: movie.category || (Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre),
      // Backend uses poster, local data uses image
      image: movie.poster || movie.image,
      poster: movie.poster || movie.image,
      // Backend uses description, local data uses desc
      desc: movie.description || movie.desc,
      description: movie.description || movie.desc,
    }));
    
    // Extract unique genres (backend returns array, local data is string)
    const allGenres = new Set();
    processedMovies.forEach((movie) => {
      console.log("[Categories] Movie genre:", movie.title || movie.name, "=>", movie.genre, movie.category);
      
      // Backend uses genre array, local data uses category string
      const genreField = movie.genre || movie.category;
      if (genreField) {
        // Handle both array (backend) and string (local) formats
        if (Array.isArray(genreField)) {
          genreField.forEach((g) => allGenres.add(g));
        } else if (typeof genreField === "string") {
          genreField.split(",").forEach((g) => allGenres.add(g.trim()));
        }
      }
    });
    
    const sortedGenres = ["all", ...Array.from(allGenres).sort()];
    console.log("🏷️ Available genres:", sortedGenres);
    
    return {
      movies: processedMovies,
      genres: sortedGenres
    };
  }, [allMovies]);

  const filteredMovies = useMemo(() => {
    console.log("[Categories] Filtering movies for genre:", selectedGenre);
    console.log("📚 Total movies to filter:", movies.length);
    
    if (selectedGenre === "all") {
      console.log("[Categories] Showing all movies:", movies.length);
      return movies;
    }
    
    const filtered = movies.filter((movie) => {
      // Check both 'genre' and 'category' fields
      const genreField = movie.genre || movie.category;
      const movieTitle = movie.title || movie.name;
      
      if (!genreField) {
        console.log("⚠️ Movie has no genre/category:", movieTitle);
        return false;
      }
      
      let hasGenre = false;
      
      if (Array.isArray(genreField)) {
        hasGenre = genreField.includes(selectedGenre);
      } else if (typeof genreField === "string") {
        hasGenre = genreField
          .split(",")
          .map((g) => g.trim())
          .includes(selectedGenre);
      }
      
      if (hasGenre) {
        console.log("[Categories] Movie matches genre:", movieTitle, genreField);
      }
      
      return hasGenre;
    });
    
    console.log("[Categories] Filtered movies count:", filtered.length);
    return filtered;
  }, [movies, selectedGenre]);

  // Genre icons are now handled by the GenreIcon component

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6 theme-bg-primary theme-text-primary">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl border-2 theme-border-accent relative h-40 sm:h-48 lg:h-56 theme-bg-secondary flex items-center justify-center mb-6 lg:mb-8">
        <div className="relative z-10 text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 tracking-wide theme-accent drop-shadow-lg">
            🎬 Browse by Categories
          </h2>
          <p className="theme-text-secondary text-sm sm:text-base lg:text-lg drop-shadow">
            Discover Games by your favorite genres
          </p>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="mb-6 lg:mb-8">
        <h3 className="text-xl lg:text-2xl font-bold theme-accent mb-3 lg:mb-4">Select genre</h3>
        <div className="flex flex-wrap gap-2 lg:gap-3">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 lg:px-4 py-2 rounded-full font-semibold transition-all duration-200 text-sm lg:text-base touch-target ${
                selectedGenre === genre
                  ? "theme-bg-accent theme-text-on-accent shadow-lg transform scale-105"
                  : "theme-bg-secondary theme-text-secondary hover:theme-bg-hover theme-border"
              }`}
            >
              {genre === "all" ? (
                <span className="flex items-center"><GenreIcon genre="all" size={16} className="lg:w-4 lg:h-4 mr-1 lg:mr-2" />All Games</span>
              ) : (
                <span className="flex items-center"><GenreIcon genre={genre} size={16} className="lg:w-4 lg:h-4 mr-1 lg:mr-2" />{genre}</span>
              )}
            </button>
          ))}
        </div>
      </div>



      {/* Results */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-2xl font-bold theme-text-primary tracking-wide">
          {selectedGenre === "all"
            ? `All Gaming (${filteredMovies.length})`
            : `${selectedGenre} Gaming (${filteredMovies.length})`}
        </h3>
      </div>
      

      {loading ? (
        <div className="flex items-center justify-center w-full h-32 theme-accent text-xl font-bold">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-32 text-xl font-bold" style={{ color: 'var(--accent-color)' }}>
          {error}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            <GenreIcon genre={selectedGenre === "all" ? "Action" : selectedGenre} size={72} className="text-gray-400" />
          </div>
          <h3 className="text-xl lg:text-2xl font-semibold mb-2 text-gray-300">
            No {selectedGenre === "all" ? "Gaming" : selectedGenre + " Gaming"} {" "}
            Found
          </h3>
            <p className="text-gray-400 text-sm lg:text-base px-4">
            {selectedGenre === "all"
              ? "No gaming available yet"
              : `No ${selectedGenre.toLowerCase()} Games available yet`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
