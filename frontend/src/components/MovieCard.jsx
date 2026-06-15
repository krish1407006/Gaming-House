import React from "react";
import StarRating from "./StarRating";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  const movieId = movie.movieId || movie._id || `temp_${Date.now()}`;
  
  // Create a reliable fallback image as base64 encoded SVG
  const fallbackImage = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg width="240" height="160" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#232323"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#7c3aed" text-anchor="middle" dy=".3em">No Image</text>
    </svg>
  `);

  // Get image source with proper fallback handling
  const getImageSrc = () => {
    const imageUrl = movie.image || movie.poster;
    // Return fallback immediately if no image URL is provided or if it's empty
    return (imageUrl && imageUrl.trim() !== '' && imageUrl !== null && imageUrl !== undefined) ? imageUrl : fallbackImage;
  };



  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg lg:rounded-xl shadow-2xl overflow-hidden hover:border-[var(--accent-color)] border-2 border-transparent transition-all duration-200 relative group h-[280px] sm:h-[320px] lg:h-[360px] w-full flex flex-col">
      <Link to={`/movie/${movieId}`} className="flex-shrink-0">
        <img
          src={getImageSrc() || fallbackImage}
          alt={movie.name || movie.title || 'Gaming poster'}
          className="w-full h-32 sm:h-36 lg:h-40 object-cover"
          onError={(e) => {
            // Only set fallback if the current src is not already the fallback
            if (e.target.src !== fallbackImage) {
              e.target.src = fallbackImage;
            }
          }}
        />
      </Link>

      {/* Watchlist button (commented out) */}
      {/* <button
        onClick={toggleWatchlist}
        disabled={isLoading}
        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 z-10 ${
          isInWatchlist
            ? "bg-[var(--accent-color)] text-black hover:bg-[var(--accent-hover)]"
            : "bg-black/50 text-white hover:bg-black/70"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        )}
      </button> */}

      <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-grow">
        {/* Title with fixed height and overflow handling */}
        <h4 className="text-sm sm:text-base lg:text-lg font-extrabold mb-1 sm:mb-2 text-[var(--accent-color)] drop-shadow line-clamp-2 h-8 sm:h-10 lg:h-14 flex items-start">
          <span className="overflow-hidden">
            {movie.name || movie.title}
          </span>
        </h4>
        
        {/* Description with fixed height - hidden on mobile */}
        <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-2 lg:mb-3 line-clamp-2 sm:line-clamp-3 h-8 sm:h-12 lg:h-16 overflow-hidden">
          {movie.desc || movie.description}
        </p>
        
        {/* Spacer to push bottom content down */}
        <div className="flex-grow"></div>
        
        {/* Bottom section with consistent positioning */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs font-bold bg-[var(--accent-color)] text-[var(--bg-primary)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow whitespace-nowrap">
              {movie.year ||
                (movie.releaseDate
                  ? new Date(movie.releaseDate).getFullYear()
                  : "N/A")}
            </span>
            <div className="flex-shrink-0 scale-75 sm:scale-90 lg:scale-100">
              <StarRating rating={movie.rating || movie.averageRating || 0} />
            </div>
          </div>

          {/* Show rating count if available - hidden on mobile */}
          {movie.ratings && movie.ratings.length > 0 && (
            <div className="text-xs text-[var(--text-secondary)] text-center hidden sm:block">
              {movie.ratings.length} rating{movie.ratings.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default MovieCard;
