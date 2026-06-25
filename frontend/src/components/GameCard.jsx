import React from "react";
import StarRating from "./StarRating";
import { Link } from "react-router-dom";

function GameCard({ game }) {
  const gameId = game.gameId || game._id || `temp_${Date.now()}`;

  const fallbackImage = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg width="240" height="160" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#232323"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#7c3aed" text-anchor="middle" dy=".3em">No Image</text>
    </svg>
  `);

  const getImageSrc = () => {
    const imageUrl = game.image || game.poster;
    return (imageUrl && imageUrl.trim() !== '' && imageUrl !== null && imageUrl !== undefined) ? imageUrl : fallbackImage;
  };

  return (
    <div className="game-card-hover card-fade-in bg-[var(--bg-secondary)] rounded-lg lg:rounded-xl shadow-lg overflow-hidden border-2 border-transparent relative group h-[340px] sm:h-[400px] lg:h-[460px] w-full flex flex-col">
      <Link to={`/game/${gameId}`} className="flex-shrink-0 relative overflow-hidden bg-[var(--bg-secondary)]">
        <div className="power-core absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 blur-xl opacity-0 pointer-events-none z-10"></div>
        <div className="power-core-ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-cyan-400 pointer-events-none z-10"></div>
        <div className="power-core-ring-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-purple-500 pointer-events-none z-10"></div>
        <img
          src={getImageSrc() || fallbackImage}
          alt={game.name || game.title || 'Gaming poster'}
          className="game-card-image w-full h-28 sm:h-32 lg:h-36 object-cover transition-all duration-300 ease-out bg-[var(--bg-secondary)]"
          onError={(e) => {
            if (e.target.src !== fallbackImage) {
              e.target.src = fallbackImage;
            }
          }}
        />
      </Link>

      <div className="game-card-content p-2 sm:p-3 lg:p-4 flex flex-col flex-grow min-h-0 transition-all duration-300 ease-out">
        <h4 className="game-card-title text-sm sm:text-base lg:text-lg font-extrabold mb-1 sm:mb-2 drop-shadow line-clamp-2 min-h-[2em] flex items-start transition-all duration-300 ease-out" style={{ color: 'var(--accent-color)' }}>
          <span className="overflow-hidden">
            {game.name || game.title}
          </span>
        </h4>

        <p className="text-[var(--text-secondary)] text-xs sm:text-sm mb-1 flex-1 leading-relaxed">
          {(game.desc || game.description)?.length > 80
            ? (game.desc || game.description).slice(0, 80) + "..."
            : game.desc || game.description}
          {(game.desc || game.description)?.length > 80 && (
            <span className="text-[var(--accent-color)] font-medium ml-1">read more</span>
          )}
        </p>
        <span className="game-card-arrow text-[10px] sm:text-xs mb-1.5 sm:mb-2 font-medium opacity-60 flex items-center gap-1 transition-all duration-300 ease-out" style={{ color: 'var(--accent-color)' }}>
          <span>Click for full details</span>
          <span className="inline-block transition-transform duration-300 ease-out">→</span>
        </span>

        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="game-card-year text-xs font-bold text-[var(--bg-primary)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow whitespace-nowrap transition-all duration-300 ease-out" style={{ backgroundColor: 'var(--accent-color)' }}>
              {game.year ||
                (game.releaseDate
                  ? new Date(game.releaseDate).getFullYear()
                  : "N/A")}
            </span>
            <div className="flex-shrink-0 scale-75 sm:scale-90 lg:scale-100">
              <StarRating rating={game.rating || game.averageRating || 0} />
            </div>
          </div>

          {game.ratings && game.ratings.length > 0 && (
            <div className="text-xs text-[var(--text-secondary)] text-center hidden sm:block">
              {game.ratings.length} rating{game.ratings.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default GameCard;