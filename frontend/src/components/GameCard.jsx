import React from "react";
import StarRating from "./StarRating";
import { Link } from "react-router-dom";

function GameCard({ game }) {
  const gameId = game.gameId || game._id || `temp_${Date.now()}`;

  const fallbackImage = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg width="240" height="160" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#141414"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#00d4ff" text-anchor="middle" dy=".3em">No Image</text>
    </svg>
  `);

  const getImageSrc = () => {
    const imageUrl = game.image || game.poster;
    return (imageUrl && imageUrl.trim() !== '' && imageUrl !== null && imageUrl !== undefined) ? imageUrl : fallbackImage;
  };

  return (
    <div className="game-card-hover card-fade-in card-glow bg-[var(--bg-secondary)] rounded-lg lg:rounded-xl shadow-lg overflow-hidden border-2 border-transparent relative group h-[320px] sm:h-[360px] lg:h-[420px] w-full flex flex-col">
      <Link to={`/game/${gameId}`} className="block flex-shrink-0">
        <div className="relative overflow-hidden bg-[var(--bg-secondary)] rounded-t-lg lg:rounded-t-xl">
          <img
            src={getImageSrc() || fallbackImage}
            alt={game.name || game.title || 'Gaming poster'}
            className="game-card-image w-full h-36 sm:h-40 lg:h-48 object-cover object-top bg-[var(--bg-secondary)]"
            onError={(e) => {
              if (e.target.src !== fallbackImage) {
                e.target.src = fallbackImage;
              }
            }}
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none z-10"></div>
        </div>
      </Link>

      <div className="p-2 sm:p-3 lg:p-4 flex flex-col flex-grow min-h-0">
        <h4 className="text-sm sm:text-base lg:text-lg font-extrabold mb-1 sm:mb-2 drop-shadow line-clamp-2 min-h-[2em] flex items-start" style={{ color: 'var(--accent-color)' }}>
          <span className="overflow-hidden">
            {game.name || game.title}
          </span>
        </h4>

        <div className="flex-1 min-h-0">
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed line-clamp-4">
            {game.desc || game.description}
          </p>
          {(game.desc || game.description)?.length > 120 && (
            <Link to={`/game/${gameId}`} className="text-[var(--accent-color)] text-xs sm:text-sm font-medium hover:opacity-80 mt-1 inline-block">read more</Link>
          )}
        </div>

        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs font-bold text-[var(--bg-primary)] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow whitespace-nowrap" style={{ backgroundColor: 'var(--accent-color)' }}>
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