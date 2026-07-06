import React from "react";
import StarRating from "./StarRating";
import { Link } from "react-router-dom";

function GameCard({ game }) {
  const gameId = game.gameId || game._id || `temp_${Date.now()}`;

  const fallbackImage = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0a0a0a"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" text-anchor="middle" dy=".3em">No Image</text>
    </svg>
  `);

  const getImageSrc = () => {
    const imageUrl = game.image || game.poster;
    return (imageUrl && imageUrl.trim() !== '' && imageUrl !== null && imageUrl !== undefined) ? imageUrl : fallbackImage;
  };

  const year = game.year ||
    (game.releaseDate
      ? new Date(game.releaseDate).getFullYear()
      : null);

  const description = game.desc || game.description;

  return (
    <Link
      to={`/game/${gameId}`}
      className="group block relative bg-[var(--bg-secondary)] transition-all duration-500 overflow-hidden w-full scale-[0.96] hover:scale-[1.0]"
    >
      <div className="aspect-[16/9] relative overflow-hidden bg-[var(--bg-primary)]">
        <img
          src={getImageSrc() || fallbackImage}
          alt={game.name || game.title || 'Game poster'}
          className="w-full h-full object-contain object-center transition-all duration-700 ease-out"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.target.src !== fallbackImage) {
              e.target.src = fallbackImage;
            }
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/40 group-hover:to-black/5 transition-all duration-500" />

        {year && (
          <span className="absolute top-3 right-3 bg-white/25 backdrop-blur-sm text-[var(--accent-color)] text-[10px] sm:text-xs font-bold px-2.5 py-1 tracking-[0.15em] border border-white/30">
            {year}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-5">
          <h3 className="text-sm sm:text-base lg:text-lg font-heading font-bold text-[var(--accent-color)] leading-tight mb-1">
            {game.name || game.title}
          </h3>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex-shrink-0 scale-[0.65] sm:scale-75 origin-left group-hover:animate-pulse">
              {game.totalRatings > 0 ? (
                <StarRating rating={game.averageRating || 0} />
              ) : (
                <span className="text-[10px] text-[var(--text-muted)]">No ratings</span>
              )}
            </div>
            {game.totalRatings > 0 && (
              <span className="text-[10px] text-[var(--text-muted)]">
                ({game.totalRatings})
              </span>
            )}
          </div>
        </div>
      </div>

      {description && (
        <div className="px-3 sm:px-4 lg:px-5 py-2 sm:py-3 relative">
          <div className="absolute top-0 left-3 right-3 h-[1px] bg-[var(--accent-color)] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {description}
          </p>
          {description.length > 100 && (
            <span className="text-[10px] sm:text-[11px] text-[var(--accent-color)] font-medium mt-0.5 inline-block relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 group-hover:after:w-full after:h-[1px] after:bg-[var(--accent-color)] after:transition-all after:duration-300">
              read more →
            </span>
          )}
        </div>
      )}

    </Link>
  );
}

export default GameCard;
