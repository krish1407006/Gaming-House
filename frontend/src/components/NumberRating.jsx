import React, { useState } from "react";

export default function NumberRating({
  rating = 0,
  onRatingChange = null,
  interactive = false,
  showLabel = true,
}) {
  const [hover, setHover] = useState(0);

  const handleNumberClick = (newRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleNumberHover = (newRating) => {
    if (interactive) {
      setHover(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHover(0);
    }
  };

  const displayRating = hover || rating;

  return (
    <div className="flex flex-col items-center gap-2">
      {showLabel && (
        <label className="text-sm font-medium text-gray-300">
          Rate this game (1-10)
        </label>
      )}

      <div className="flex gap-2" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => interactive && handleNumberClick(number)}
            onMouseEnter={() => interactive && handleNumberHover(number)}
            disabled={!interactive}
            className={`
              w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200
              ${
                interactive
                  ? "cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                  : "cursor-default"
              }
              ${
                number <= displayRating
                  ? "bg-[#f5c518] text-black shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }
              ${interactive && hover >= number ? "transform scale-105" : ""}
            `}
            title={interactive ? `Rate ${number} out of 10` : undefined}
          >
            {number}
          </button>
        ))}
      </div>

      {displayRating > 0 && (
        <div className="text-center">
          <span className="text-2xl font-bold text-[#f5c518]">
            {displayRating}/10
          </span>
          {interactive && (
            <p className="text-xs text-gray-400 mt-1">
              Click to rate • Hover to preview
            </p>
          )}
        </div>
      )}
    </div>
  );
}
