import React, { useState } from "react";

export default function StarRating({
  rating = 0,
  onRatingChange = null,
  size = "medium",
  interactive = false,
  showValue = true,
  scale = "5", // "5" for 5-star, "10" for 10-point
}) {
  const [hover, setHover] = useState(0);

  const sizes = {
    small: "w-4 h-4",
    medium: "w-5 h-5",
    large: "w-6 h-6",
  };

  const handleStarClick = (newRating) => {
    if (interactive && onRatingChange) {
      console.log("StarRating: Clicked star", newRating);
      if (scale === "10") {
        // For 10-point scale, each star represents 2 points
        const tenPointRating = newRating * 2;
        onRatingChange(tenPointRating);
      } else {
        // For 5-star scale, convert to 10-point for backend
        const tenPointRating = newRating * 2;
        onRatingChange(tenPointRating);
      }
    }
  };

  const handleStarHover = (newRating) => {
    if (interactive) {
      setHover(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHover(0);
    }
  };

  // Convert rating to display format
  const displayRating =
    scale === "10"
      ? hover
        ? hover
        : rating / 2 // For 10-point, show as 5-star equivalent
      : hover
      ? hover
      : rating / 2; // For 5-star, same conversion

  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const isFilled = displayRating >= i;
    const isHalfFilled = displayRating >= i - 0.5 && displayRating < i;

    stars.push(
      <button
        key={i}
        type="button"
        className={`${sizes[size]} transition-all duration-200 ${
          interactive
            ? "cursor-pointer hover:scale-125 focus:outline-none hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            : "cursor-default"
        }`}
        onClick={() => interactive && handleStarClick(i)}
        onMouseEnter={() => interactive && handleStarHover(i)}
        disabled={!interactive}
        title={interactive ? `Rate ${i} out of 5 stars` : undefined}
      >
        {isFilled ? (
            <svg
            className="w-full h-full text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
        ) : isHalfFilled ? (
          <div className="relative w-full h-full">
            <svg
              className="w-full h-full text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
            </svg>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <svg
                className="w-full h-full text-[var(--accent-color)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
              </svg>
            </div>
          </div>
        ) : (
          <svg
            className={`w-full h-full ${
              interactive && hover >= i ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
      <div className="flex items-center">{stars}</div>
      {showValue && (
        <span className="text-sm text-gray-400 ml-2">{rating}/10</span>
      )}
    </div>
  );
}
