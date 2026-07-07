import { useAuth, useUser } from "@clerk/clerk-react";
import React, { useEffect, useState, useCallback } from "react";
import {
  FaArrowLeft,
  FaBookmark,
  FaHeart,
  FaShare,
  FaStar,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaSteam,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import GameCard from "../components/GameCard";
import ReviewSection from "../components/ReviewSection";
import apiService from "../services/api";

export default function GameDetailPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState("");

  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedGames, setRelatedGames] = useState([]);
  const [downloads, setDownloads] = useState({ steamAppId: null, downloads: [] });

  useEffect(() => {
    if (getToken) {
      window.__clerk_token_getter = getToken;
    }
  }, [getToken]);

  const loadMovieData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!id || id.trim() === "" || id === "undefined" || id === "null") {
      setError("Invalid game ID");
      setLoading(false);
      return;
    }

    try {
      const movieData = await apiService.getGameById(id);

      if (movieData && (movieData._id || movieData.id)) {
        setGame(movieData);

        const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
        const liked = JSON.parse(localStorage.getItem("likedGames") || "[]");

        setIsWatchlisted(watchlist.includes(id));
        setIsLiked(liked.includes(id));

        try {
            const related = await apiService.getGames({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' });
          if (related?.games) {
            const shuffled = [...related.games].sort(() => Math.random() - 0.5);
            setRelatedGames(shuffled.filter(g => (g._id || g.id) !== movieData._id).slice(0, 3));
          }
        } catch {}

        try {
          const downloadData = await apiService.getGameDownloads(movieData._id || movieData.id || id);
          setDownloads(downloadData);
        } catch {}

        setLoading(false);
        return;
      }
    } catch {
      // Backend failed
    }

    setError(`Game with ID "${id}" not found.`);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadMovieData();
  }, [loadMovieData]);

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (isSignedIn && game) {
        const gameId = game?._id || game?.id || game?.gameId || id;

        if (!gameId) {
          return;
        }

        try {
          const watchlistStatus = await apiService.checkWatchlistStatus(gameId);
          setIsWatchlisted(watchlistStatus.isInWatchlist);
        } catch {
          const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
          setIsWatchlisted(watchlist.includes(gameId));
        }
      }
    };

    checkWatchlistStatus();
  }, [isSignedIn, game, id]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleWatchlistToggle = async () => {
    if (!isSignedIn) {
      showNotification("Please sign in to add to watchlist");
      return;
    }

    const gameId = game?._id || game?.id || game?.gameId || id;

    if (!gameId) {
      showNotification("Error: Game ID not found");
      return;
    }

    try {
      if (isWatchlisted) {
        await apiService.removeFromWatchlist(gameId);
        setIsWatchlisted(false);
        showNotification("Removed from watchlist");
      } else {
        await apiService.addToWatchlist(gameId);
        setIsWatchlisted(true);
        showNotification("Added to watchlist");
      }
    } catch (error) {
      if (error.message.includes("already in watchlist")) {
        setIsWatchlisted(true);
        showNotification("Game is already in watchlist");
        return;
      }

      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
      if (isWatchlisted) {
        const updated = watchlist.filter((gid) => gid !== gameId);
        setIsWatchlisted(false);
        localStorage.setItem("watchlist", JSON.stringify(updated));
        showNotification("Removed from watchlist (offline)");
      } else {
        const updated = [...watchlist, gameId];
        setIsWatchlisted(true);
        localStorage.setItem("watchlist", JSON.stringify(updated));
        showNotification("Added to watchlist (offline)");
      }
    }
  };

  const handleLikeToggle = () => {
    const liked = JSON.parse(localStorage.getItem("likedGames") || "[]");
    if (isLiked) {
      const updated = liked.filter((gid) => gid !== id);
      setIsLiked(false);
      localStorage.setItem("likedGames", JSON.stringify(updated));
      showNotification("Removed from favorites");
    } else {
      const updated = [...liked, id];
      setIsLiked(true);
      localStorage.setItem("likedGames", JSON.stringify(updated));
      showNotification("Added to favorites");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${game.title} - Gaming House`;
    const text = `${game.description}\n\nRated ${game.averageRating}/10 stars`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        showNotification("Shared successfully!");
      } catch (error) {
        if (error.name !== "AbortError") {
          showNotification("Sharing cancelled or failed");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showNotification("Link copied to clipboard!");
      } catch {
        showNotification("Sharing not supported on this browser");
      }
    }
  };

  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedImageIndex(null);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === 0 ? game.screenshots.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === game.screenshots.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === "Escape") handleCloseLightbox();
      if (e.key === "ArrowLeft") handlePrevImage(e);
      if (e.key === "ArrowRight") handleNextImage(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex]);

  const handleReviewUpdate = (updatedRating) => {
    if (updatedRating) {
      showNotification(
        `Review ${updatedRating.rating ? "updated" : "submitted"} successfully!`
      );
    } else {
      showNotification("Review deleted successfully!");
    }
    loadMovieData();
  };

  if (loading) {
    return (
      <section className="px-4 lg:px-8 py-4 lg:py-6 theme-bg-primary">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
        </div>
      </section>
    );
  }

  if (error || !game) {
    return (
      <section className="px-4 lg:px-8 py-4 lg:py-6 theme-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center p-8 theme-bg-glass rounded-xl shadow-lg max-w-md mx-auto">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto" style={{ color: 'var(--accent-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold theme-text-primary mb-2">Game Not Found</h2>
          <p className="theme-text-secondary mb-6">
            {error || `Sorry, we couldn't find the game with ID: ${id}`}
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
    <section className="px-4 lg:px-8 py-4 lg:py-6 theme-bg-primary theme-text-primary">
      {notification && (
        <div className="fixed top-4 right-4 theme-bg-accent theme-text-accent-contrast px-4 lg:px-6 py-2 lg:py-3 rounded-lg shadow-lg z-50 font-semibold text-sm lg:text-base">
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-4 lg:mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 theme-accent hover:theme-accent-hover transition-colors text-sm lg:text-base"
          >
            <FaArrowLeft /> Back to Games List
          </Link>
        </div>

        <div className="relative mb-6 lg:mb-8 rounded-xl lg:rounded-2xl shadow-2xl">
          <div className="absolute inset-0 theme-gradient-overlay z-10"></div>
          <img
            src={game.backdrop || game.poster}
            alt={game.title}
            className="w-full h-48 sm:h-64 lg:h-96 object-cover"
            onError={(e) => {
              if (e.target.src !== game.poster) {
                e.target.src = game.poster;
              }
            }}
          />
          <div className="absolute inset-0 z-20 flex items-center px-4 sm:px-8 lg:px-12">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-center max-w-4xl w-full">
              <img
                src={game.poster}
                alt={game.title}
                className="w-20 sm:w-32 lg:w-48 h-auto rounded-lg lg:rounded-xl shadow-2xl border-2 theme-border-accent shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-xl sm:text-3xl lg:text-5xl font-bold theme-accent mb-2 lg:mb-4 drop-shadow-lg font-heading">
                  {game.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 lg:gap-6 mb-4 lg:mb-6">
                  <span className="text-sm lg:text-lg font-bold bg-white/10 text-white px-2 lg:px-3 py-0.5 lg:py-1 rounded">
                    {new Date(game.releaseDate).getFullYear()}
                  </span>
                  <div className="flex items-center gap-1 lg:gap-2">
                    <FaStar className="text-amber-400 text-sm lg:text-lg drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                    {game.totalRatings > 0 ? (
                      <>
                        <span className="text-white text-sm lg:text-lg font-semibold">
                          {game.averageRating.toFixed(1)}
                          /10
                        </span>
                        <span className="text-white/50 text-xs lg:text-sm">
                          ({game.totalRatings}{" "}
                          {game.totalRatings === 1 ? "rating" : "ratings"})
                        </span>
                      </>
                    ) : (
                      <span className="text-white/50 text-sm lg:text-lg">
                        No ratings yet
                      </span>
                    )}
                  </div>
                  <span className="bg-white/10 text-white px-2 lg:px-3 py-0.5 lg:py-1 rounded border border-white/20 text-xs lg:text-base">
                    {game.genre?.[0] || "Adventure"}
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 lg:gap-4">
                  <button
                    onClick={handleWatchlistToggle}
                    className={`px-3 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1 lg:gap-2 text-xs lg:text-base hover:scale-105 active:scale-95 ${
                      isWatchlisted
                        ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        : "bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    }`}
                  >
                    <FaBookmark className="text-xs lg:text-base" />{" "}
                    {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
                  </button>
                  <button
                    onClick={handleLikeToggle}
                    className={`p-2 lg:p-3 rounded-lg transition-all duration-300 hover:scale-110 active:scale-90 ${
                      isLiked
                        ? "bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]"
                        : "bg-white/10 text-white/70 hover:text-red-500 hover:bg-red-600/10 hover:shadow-[0_0_12px_rgba(220,38,38,0.2)]"
                    }`}
                  >
                    <FaHeart className="text-sm lg:text-base" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 lg:p-3 bg-white/10 text-white/70 rounded-lg transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-110 active:scale-90"
                    title="Share this game"
                  >
                    <FaShare className="text-sm lg:text-base" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <div className="theme-bg-glass rounded-xl overflow-hidden">
              <div className="px-4 lg:px-8 pt-4 lg:pt-8 pb-2 lg:pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 lg:h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--accent-color), transparent)' }}></div>
                  <h2 className="text-xl lg:text-2xl font-heading font-bold tracking-tight">Overview</h2>
                </div>
              </div>
              <div className="p-4 lg:p-8 space-y-8 lg:space-y-10">
                <div className="leading-[1.8] lg:leading-[1.9] text-sm lg:text-base opacity-80 tracking-wide">
                  {game.description?.split(/(?<=[.!?])\s+/).map((sentence, i) => (
                    <p key={i} className="mb-3 last:mb-0">{sentence}</p>
                  ))}
                </div>

                {game.highlights && game.highlights.length > 0 && (
                  <div>
                    <h3 className="text-sm font-heading font-semibold tracking-wider mb-4 uppercase text-amber-400/90">Key Features</h3>
                    <ul className="space-y-2.5">
                      {game.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm lg:text-base">
                          <span className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 bg-amber-400/70"></span>
                          <span className="opacity-70 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
                  <div>
                    <h3 className="text-sm font-heading font-semibold tracking-wider mb-4 uppercase text-sky-400/90">Details</h3>
                    <div className="space-y-2">
                      {[
                        ['Publisher', game.publisher],
                        ['Released', game.releaseDate ? new Date(game.releaseDate).getFullYear() : null],
                        ['Genre', game.genre?.join(', ')],
                        ['Duration', game.duration ? `${game.duration} min` : null],
                        ['Language', game.language],
                        ['Country', game.country],
                      ].filter(([_, v]) => v).map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/5">
                          <span className="text-xs lg:text-sm opacity-50">{label}</span>
                          <span className="text-xs lg:text-sm font-medium text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-heading font-semibold tracking-wider mb-4 uppercase text-emerald-400/90">Cast & Crew</h3>
                    <div className="space-y-2">
                      {[
                        ['Director', game.director],
                        ['Studio', game.cast?.join(', ')],
                        ['Budget', game.budget ? `$${(game.budget / 1000000).toFixed(1)}M` : null],
                        ['Box Office', game.boxOffice ? `$${(game.boxOffice / 1000000).toFixed(1)}M` : null],
                      ].filter(([_, v]) => v).map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/5">
                          <span className="text-xs lg:text-sm opacity-50">{label}</span>
                          <span className="text-xs lg:text-sm font-medium text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {game.screenshots && game.screenshots.length > 0 && (
              <div className="theme-bg-glass rounded-xl p-4 lg:p-8 mb-6 lg:mb-8 border border-white/5">
                <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                  <span className="w-1 theme-bg-accent h-5 lg:h-6 inline-block rounded-full"></span>
                  <h2 className="text-xl lg:text-2xl font-bold theme-text-primary">Game Images</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4">
                  {game.screenshots.map((screenshot, index) => (
                    <div
                      key={index}
                      className="rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={screenshot}
                        alt={`${game.title} game image ${index + 1}`}
                        className="w-full h-24 sm:h-32 lg:h-40 object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedImageIndex !== null && game.screenshots && (
              <div
                className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
                onClick={handleCloseLightbox}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

                <button
                  onClick={handleCloseLightbox}
                  className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-all"
                >
                  <FaTimes />
                </button>

                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-4 text-white/80 hover:text-white text-3xl z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-all"
                >
                  <FaChevronLeft />
                </button>

                <img
                  src={game.screenshots[selectedImageIndex]}
                  alt={`${game.title} game image ${selectedImageIndex + 1}`}
                  className="select-none"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    margin: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                  }}
                  onClick={(e) => e.stopPropagation()}
                  draggable={false}
                />

                <button
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-4 text-white/80 hover:text-white text-3xl z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-all"
                >
                  <FaChevronRight />
                </button>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white/80 text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
                  {selectedImageIndex + 1} / {game.screenshots.length}
                </div>
              </div>
            )}

            <ReviewSection
              gameId={game._id || game.gameId || id}
              onReviewUpdate={handleReviewUpdate}
            />

            {relatedGames.length > 0 && (
              <div className="theme-bg-glass rounded-xl overflow-hidden border border-white/5">
                <div className="px-4 lg:px-8 pt-4 lg:pt-8 pb-2 lg:pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 lg:h-6 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--accent-color), transparent)' }}></div>
                    <h2 className="text-xl lg:text-2xl font-heading font-bold tracking-tight">More Games</h2>
                  </div>
                </div>
                <div className="p-4 lg:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {relatedGames.map((g) => (
                      <GameCard key={g._id || g.gameId} game={g} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:space-y-6">
            <div className="theme-bg-glass rounded-xl overflow-hidden border border-white/5">
              <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-2 lg:pb-3 border-b border-white/5">
                <h3 className="text-base lg:text-lg font-heading font-bold tracking-tight">Quick Stats</h3>
              </div>
              <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
                {[
                  ['Rating', game.totalRatings > 0 ? `${game.averageRating.toFixed(1)}/10` : 'N/A'],
                  ['Reviews', game.totalRatings || 0],
                  ['Released', game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'N/A'],
                  ['Status', game.isActive ? 'Available' : 'Unavailable'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs lg:text-sm opacity-50">{label}</span>
                    <span className="text-xs lg:text-sm font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-bg-glass rounded-xl overflow-hidden border border-white/5">
              <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-2 lg:pb-3 border-b border-white/5">
                <h3 className="text-base lg:text-lg font-heading font-bold tracking-tight">Poster</h3>
              </div>
              <div className="p-4 lg:p-6">
                <img
                  src={game.poster}
                  alt={game.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>

            {(downloads.steamAppId || downloads.downloads.some(d => d.type === 'genuine') || downloads.downloads.some(d => d.type === 'piracy')) && (
              <div className="rounded-xl overflow-hidden relative group/downloads theme-bg-glass">
                <div className="relative">
                  <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-3 lg:pb-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)' }}>
                          <FaDownload className="text-white text-sm" />
                        </div>
                        <div>
                          <h3 className="text-base lg:text-lg font-heading font-bold tracking-tight text-white">Download Game</h3>
                          <p className="text-[10px] text-white/60 -mt-0.5">Choose your source</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 lg:p-5 space-y-3">
                    {(downloads.steamAppId || downloads.downloads.some(d => d.type === 'genuine')) && (
                      <>
                        <p className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">Official Sources</p>
                        <div className="space-y-2">
                          {downloads.steamAppId && (
                            <a
                              href={`https://store.steampowered.com/app/${downloads.steamAppId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.preventDefault();
                                const steamUrl = `steam://store/${downloads.steamAppId}`;
                                const webUrl = `https://store.steampowered.com/app/${downloads.steamAppId}`;
                                const iframe = document.createElement('iframe');
                                iframe.style.position = 'fixed';
                                iframe.style.top = '-9999px';
                                iframe.style.width = '0';
                                iframe.style.height = '0';
                                iframe.src = steamUrl;
                                document.body.appendChild(iframe);
                                const timer = setTimeout(() => {
                                  document.body.removeChild(iframe);
                                  window.open(webUrl, '_blank', 'noopener');
                                }, 800);
                                window.addEventListener('blur', () => {
                                  clearTimeout(timer);
                                  document.body.removeChild(iframe);
                                }, { once: true });
                              }}
                              className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 hover:border-white/20 cursor-pointer bg-black/20 backdrop-blur-sm"
                            >
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/10">
                                <FaSteam className="text-xl text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white">Open in Steam</p>
                                <p className="text-xs text-blue-300 truncate">Launches Steam client &dash; Install now</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-white bg-emerald-500/90 px-2 py-1 rounded-md">Official</span>
                                <FaExternalLinkAlt className="text-xs text-white/40 group-hover:text-white/80 transition-colors shrink-0" />
                              </div>
                            </a>
                          )}
                          {downloads.downloads.filter(d => d.type === 'genuine').map((dl, i) => (
                            <a
                              key={dl._id}
                              href={dl.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 hover:border-white/20 cursor-pointer bg-black/20 backdrop-blur-sm"
                            >
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/10">
                                <FaExternalLinkAlt className="text-sm text-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{dl.label}</p>
                                <p className="text-xs text-white/50 truncate">{dl.url}</p>
                              </div>
                              <span className="text-[10px] font-bold text-white bg-emerald-500/90 px-2 py-1 rounded-md">Official</span>
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                    {downloads.downloads.filter(d => d.type === 'piracy').length > 0 && (
                      <>
                        <p className="text-[11px] font-bold text-red-400 tracking-wider uppercase pt-2">Unofficial Sources</p>
                        <div className="space-y-2">
                          {downloads.downloads.filter(d => d.type === 'piracy').map((dl, i) => (
                            <a
                              key={dl._id}
                              href={dl.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-black/20 backdrop-blur-sm"
                              style={{ border: '1px solid rgba(220,38,38,0.35)' }}
                            >
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 0 16px rgba(220,38,38,0.4)' }}>
                                <FaDownload className="text-white text-sm" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{dl.label}</p>
                                <p className="text-xs text-white/50 truncate group-hover:text-white/70 transition-colors">{dl.url}</p>
                              </div>
                              <span className="text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-1 rounded-md border border-red-500/30">Free</span>
                              <FaExternalLinkAlt className="text-xs text-white/30 group-hover:text-white/60 transition-all shrink-0" />
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                    <p className="text-[10px] text-center text-white/30 pt-0.5">Links open in a new tab</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
