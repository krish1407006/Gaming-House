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
    <div className="bg-[var(--bg-secondary)] rounded-lg lg:rounded-xl shadow-lg hover:shadow-2xl hover:shadow-[var(--accent-color)]/20 overflow-hidden hover:border-[var(--accent-color)] border-2 border-transparent transition-all duration-300 hover:-translate-y-1 relative group h-[340px] sm:h-[400px] lg:h-[460px] w-full flex flex-col">
      <Link to={`/movie/${movieId}`} className="flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <img
          src={getImageSrc() || fallbackImage}
          alt={movie.name || movie.title || 'Gaming poster'}
          className="w-full h-28 sm:h-32 lg:h-36 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            if (e.target.src !== fallbackImage) {
              e.target.src = fallbackImage;
            }
          }}
        />
      </Link>

      <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-grow min-h-0">
        <h4 className="text-sm sm:text-base lg:text-lg font-extrabold mb-1 sm:mb-2 text-[var(--accent-color)] drop-shadow line-clamp-2 min-h-[2em] flex items-start">
          <span className="overflow-hidden">
            {movie.name || movie.title}
          </span>
        </h4>

        <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-2 lg:mb-3 line-clamp-3 sm:line-clamp-5 lg:line-clamp-6 overflow-y-auto flex-1 scrollbar-thin">
          {movie.desc || movie.description}
        </p>

        <div className="flex-shrink-0">
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
