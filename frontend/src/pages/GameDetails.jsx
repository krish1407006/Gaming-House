import { useAuth, useUser } from "@clerk/clerk-react";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBookmark,
  FaHeart,
  FaShare,
  FaStar,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import ReviewSection from "../components/ReviewSection";
import apiService from "../services/api";

export default function MovieDetailPage({ allMovies }) {
  const { id } = useParams();
  const { getToken } = useAuth();
  const {  isSignedIn } = useUser();

  // Use backend data if available, fallback to prop data
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState("");

  // Local state for watchlist and favorites (these could also be moved to backend)
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Set up auth token for API service
  useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
      //   console.log("Auth token getter set" + isSignedIn);
    }
  }, [getToken]);

  const loadMovieData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    // Basic validation - only reject truly invalid IDs
      if (!id || id.trim() === '' || id === 'undefined' || id === 'null') {
        setError("Invalid gaming ID");
      setLoading(false);
      return;
    }

    // Determine if this is a MongoDB ObjectId or a simple string ID
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    try {
      // Try to get movie from backend first
      const movieData = await apiService.getMovieById(id);

      if (movieData && (movieData._id || movieData.id)) {
        setMovie(movieData);
        console.log("🎬 Loaded games from backend:", movieData.title || movieData.name);

        // Load user preferences from localStorage
        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        const liked = JSON.parse(localStorage.getItem("likedMovies") || "[]");

        setIsWatchlisted(watchlist.includes(id));
        setIsLiked(liked.includes(id));
        setLoading(false);
        return;
      }
    } catch {
      // Backend failed, continue to fallback
    }

    // Fallback to local data - try exact match with all possible ID fields
    let fallbackMovie = allMovies?.find((m) => 
      m.movieId === id || m._id === id || m.id === id
    );
    
    // If not found and it's an ObjectId, we can't match local data
      if (!fallbackMovie && isObjectId) {
        setError(`Gaming with ObjectId "${id}" not found. Backend connection may be required.`);
      setLoading(false);
      return;
    }

    // If not found with simple ID, show available options
      if (!fallbackMovie) {
        const availableIds = allMovies?.map(m => 
          m.movieId || m._id || m.id || 'no-id'
        ).join(', ') || 'none';
        setError(`Gaming with ID "${id}" not found. Available IDs: ${availableIds}`);
      setLoading(false);
      return;
    }

    // Found in local data
    setMovie({
      _id: id,
      title: fallbackMovie.name,
      description: fallbackMovie.desc,
      poster: fallbackMovie.image,
      releaseDate: new Date(fallbackMovie.year, 0, 1),
      averageRating: fallbackMovie.rating || 0,
      totalRatings: 0,
      genre: [fallbackMovie.category],
      // Add other required fields with defaults
      director: "Unknown",
      cast: [],
      duration: 120,
      language: "English",
      country: "USA",
      isActive: true,
    });

    // Load user preferences from localStorage for fallback
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    const liked = JSON.parse(localStorage.getItem("likedMovies") || "[]");

    setIsWatchlisted(watchlist.includes(id));
    setIsLiked(liked.includes(id));
    setLoading(false);
  }, [id, allMovies]);

  // Load movie data (wait for allMovies to be available)
  useEffect(() => {
    // Only load if we have allMovies or if it's null (meaning it failed to load)
    if (allMovies !== undefined) {
      loadMovieData();
    }
  }, [loadMovieData, allMovies]);

  // Check watchlist status when user signs in (with error handling)
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (isSignedIn && movie) {
        const movieId = movie?._id || movie?.id || movie?.movieId || id;

        
        if (!movieId) {
          console.error('No valid game ID found for watchlist check');
          return;
        }
        
        try {
          const watchlistStatus = await apiService.checkWatchlistStatus(movieId);
          setIsWatchlisted(watchlistStatus.isInWatchlist);
        } catch {
          // Silently fallback to localStorage without logging errors
          const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
          setIsWatchlisted(watchlist.includes(movieId));
        }
      }
    };

    checkWatchlistStatus();
  }, [isSignedIn, movie, id]);

  // Show notification helper
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  // Handle watchlist toggle
  const handleWatchlistToggle = async () => {
    if (!isSignedIn) {
      showNotification("Please sign in to add to watchlist");
      return;
    }

    // Get the correct movie ID - try different possible properties
    const movieId = movie?._id || movie?.id || movie?.movieId || id;
    
    if (!movieId) {
      showNotification("Error: Gaming ID not found");
      return;
    }

    try {
      if (isWatchlisted) {
        // Remove from watchlist
        await apiService.removeFromWatchlist(movieId);
        setIsWatchlisted(false);
        showNotification("Removed from watchlist");
        console.log('Game removed from watchlist:', movieId);
      } else {
        // Add to watchlist
        await apiService.addToWatchlist(movieId);
        setIsWatchlisted(true);
        showNotification("Added to watchlist");
        console.log('Game added to watchlist:', movieId);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      
      // Handle 409 conflict (movie already in watchlist)
      if (error.message.includes('already in watchlist')) {
        setIsWatchlisted(true);
        showNotification("Gaming is already in watchlist");
        return;
      }
      
      // Fallback to localStorage for offline functionality
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      let updatedWatchlist;

      if (isWatchlisted) {
        updatedWatchlist = watchlist.filter((movieId) => movieId !== movie.movieId);
        setIsWatchlisted(false);
        showNotification("Removed from watchlist (offline)");
      } else {
        updatedWatchlist = [...watchlist, movie.movieId];
        setIsWatchlisted(true);
        showNotification("Added to watchlist (offline)");
      }

      localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    }
  };

  // Handle like toggle
  const handleLikeToggle = () => {
    const liked = JSON.parse(localStorage.getItem("likedMovies") || "[]");
    let updatedLiked;

    if (isLiked) {
      updatedLiked = liked.filter((movieId) => movieId !== id);
      setIsLiked(false);
      showNotification("Removed from favorites");
    } else {
      updatedLiked = [...liked, id];
      setIsLiked(true);
      showNotification("Added to favorites");
    }

    localStorage.setItem("likedMovies", JSON.stringify(updatedLiked));
  };

  // Handle share functionality
  const handleShare = async () => {
    const url = window.location.href;
  const title = `${movie.title} - Gaming House`;
    const text = `${movie.description}\n\nRated ${movie.averageRating}/10 stars`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        showNotification("Shared successfully!");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          showNotification("Sharing cancelled or failed");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showNotification("Link copied to clipboard!");
      } catch (clipboardError) {
        showNotification("Sharing not supported on this browser");
        console.error("Clipboard fallback failed:", clipboardError);
      }
    }
  };

  // Handle review updates from ReviewSection
  const handleReviewUpdate = (updatedRating) => {
    if (updatedRating) {
      showNotification(
        `Review ${updatedRating.rating ? "updated" : "submitted"} successfully!`
      );
    } else {
      showNotification("Review deleted successfully!");
    }

    // Optionally refresh movie data to get updated averages
    loadMovieData();
  };

  if (loading) {
    return (
      <section className="px-8 py-6 theme-bg-primary">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
        </div>
      </section>
    );
  }

  if (error || !movie) {
    return (
      <section className="px-8 py-6 theme-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center p-8 theme-bg-secondary rounded-xl shadow-lg max-w-md mx-auto">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold theme-text-primary mb-2">Gaming Not Found</h2>
          <p className="theme-text-secondary mb-6">
            {error || `Sorry, we couldn't find the gaming with ID: ${id}`}
          </p>
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full theme-bg-accent theme-text-accent-contrast px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              Back to Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="block w-full theme-border theme-text-primary px-6 py-3 rounded-lg border hover:theme-bg-secondary transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-8 py-6 theme-bg-primary theme-text-primary">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 theme-bg-accent theme-text-accent-contrast px-6 py-3 rounded-lg shadow-lg z-50 font-semibold">
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 theme-accent hover:theme-accent-hover transition-colors"
          >
            <FaArrowLeft /> Back to Games List
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 theme-gradient-overlay z-10"></div>
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-96 object-cover"
            onError={(e) => {
              if (e.target.src !== movie.poster) {
                e.target.src = movie.poster;
              }
            }}
          />
          <div className="absolute inset-0 z-20 flex items-center px-12">
            <div className="flex gap-8 items-center max-w-4xl">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-48 h-72 object-cover rounded-xl shadow-2xl border-2 theme-border-accent"
              />
              <div className="flex-1">
                <h1 className="text-5xl font-bold theme-accent mb-4 drop-shadow-lg">
                  {movie.title}
                </h1>
                

                {/* Movie Info */}
                <div className="flex items-center gap-6 mb-6">
                  <span className="text-lg font-bold theme-bg-accent theme-text-accent-contrast px-3 py-1 rounded">
                    {new Date(movie.releaseDate).getFullYear()}
                  </span>
                  <div className="flex items-center gap-2">
                    <FaStar className="theme-accent" />
                    <span className="theme-text-primary text-lg font-semibold">
                      {movie.averageRating
                        ? movie.averageRating.toFixed(1)
                        : "N/A"}
                      /10
                    </span>
                    <span className="theme-text-secondary text-sm">
                      ({movie.totalRatings || 0}{" "}
                      {movie.totalRatings === 1 ? "rating" : "ratings"})
                    </span>
                  </div>
                  <span className="theme-bg-secondary theme-accent px-3 py-1 rounded border theme-border-accent">
                    {movie.genre?.[0] || "Adventure"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleWatchlistToggle}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isWatchlisted
                        ? "theme-bg-accent theme-text-accent-contrast"
                        : "theme-bg-secondary theme-accent border theme-border-accent hover:theme-bg-accent hover:theme-text-accent-contrast"
                    }`}
                  >
                    <FaBookmark />{" "}
                    {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
                  </button>
                  <button
                    onClick={handleLikeToggle}
                    className={`p-3 rounded-lg transition-colors ${
                      isLiked
                        ? "bg-red-600 text-white"
                        : "theme-bg-secondary theme-text-secondary hover:text-red-500"
                    }`}
                  >
                    <FaHeart />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 theme-bg-secondary theme-text-secondary rounded-lg hover:theme-accent transition-colors"
                    title="Share this gaming"
                  >
                    <FaShare />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Movie Overview */}
            <div className="theme-bg-secondary rounded-xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-1 theme-bg-accent h-6 inline-block rounded-full"></span>
                <h2 className="text-2xl font-bold theme-text-primary">Overview</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold theme-text-primary mb-3">
                    Synopsis
                  </h3>
                  <p className="theme-text-secondary leading-relaxed">
                    {movie.description}
                  </p>
                  
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold theme-accent mb-2">
                      Details
                    </h4>
                    <div className="space-y-2 theme-text-secondary">
                      <p>
                        <span className="theme-text-primary font-medium">
                          Release Year:
                        </span>{" "}
                        {new Date(movie.releaseDate).getFullYear()}
                      </p>
                      <p>
                        <span className="theme-text-primary font-medium">Genre:</span>{" "}
                        {movie.genre?.join(", ") || "N/A"}
                      </p>
                      <p>
                        <span className="theme-text-primary font-medium">
                          Duration:
                        </span>{" "}
                        {movie.duration ? `${movie.duration} min` : "N/A"}
                      </p>
                      <p>
                        <span className="theme-text-primary font-medium">
                          Language:
                        </span>{" "}
                        {movie.language || "N/A"}
                      </p>
                      <p>
                        <span className="theme-text-primary font-medium">Country:</span>{" "}
                        {movie.country || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold theme-accent mb-2">
                      Cast & Crew
                    </h4>
                    <div className="space-y-2 theme-text-secondary">
                      <p>
                        <span className="theme-text-primary font-medium">
                          Director:
                        </span>{" "}
                        {movie.director || "N/A"}
                      </p>
                      <p>
                        <span className="theme-text-primary font-medium">Cast:</span>{" "}
                        {movie.cast?.join(", ") || "N/A"}
                      </p>
                      {movie.budget && (
                        <p>
                          <span className="theme-text-primary font-medium">
                            Budget:
                          </span>{" "}
                          ${(movie.budget / 1000000).toFixed(1)}M
                        </p>
                      )}
                      {movie.boxOffice && (
                        <p>
                          <span className="theme-text-primary font-medium">
                            Box Office:
                          </span>{" "}
                          ${(movie.boxOffice / 1000000).toFixed(1)}M
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Screenshots / Gallery */}
            {movie.screenshots && movie.screenshots.length > 0 && (
              <div className="theme-bg-secondary rounded-xl p-8 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-1 theme-bg-accent h-6 inline-block rounded-full"></span>
                  <h2 className="text-2xl font-bold theme-text-primary">Screenshots</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {movie.screenshots.map((screenshot, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
                      <img
                        src={screenshot}
                        alt={`${movie.title} screenshot ${index + 1}`}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewSection
              movieId={movie._id || movie.movieId || id}
              onReviewUpdate={handleReviewUpdate}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="theme-bg-secondary rounded-xl p-6">
              <h3 className="text-xl font-bold theme-accent mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="theme-text-secondary">Gaming House Rating</span>
                  <span className="theme-text-primary font-semibold">
                    {movie.averageRating
                      ? movie.averageRating.toFixed(1)
                      : "N/A"}
                    /10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="theme-text-secondary">Total Ratings</span>
                  <span className="theme-text-primary font-semibold">
                    {movie.totalRatings || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="theme-text-secondary">Release Date</span>
                  <span className="theme-text-primary font-semibold">
                    {new Date(movie.releaseDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="theme-text-secondary">Status</span>
                  <span className="theme-text-primary font-semibold">
                    {movie.isActive ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Movie Poster */}
            <div className="theme-bg-secondary rounded-xl p-6">
              <h3 className="text-xl font-bold theme-accent mb-4">Poster</h3>
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
