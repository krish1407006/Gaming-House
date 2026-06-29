import React, { useState, useEffect } from "react";
import GameCard from "../components/GameCard";
import ApiService from "../services/api";
import { SignInButton, useUser } from "@clerk/clerk-react";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use backend API for watchlist
        console.log("Fetching watchlist from backend...");
        const watchlistItems = await ApiService.getWatchlist();
        console.log("Watchlist items received:", watchlistItems);
        console.log("Watchlist items type:", typeof watchlistItems, "Array?", Array.isArray(watchlistItems));

        if (Array.isArray(watchlistItems)) {
          // Extract game IDs from watchlist items and ensure they're strings
          const gameIds = watchlistItems.map((item) => String(item.gameId || item.movieId));
          console.log("game IDs from watchlist:", gameIds);
          console.log("gameIds after string conversion:", gameIds.map(id => `'${id}' (${typeof id})`));
          
          // Fetch full game details for each game ID
          const allgamesResponse = await ApiService.getGames();
          console.log("🌐 Full API Response:", allgamesResponse);
          
          // Handle new API response structure with pagination
          const games = Array.isArray(allgamesResponse) 
            ? allgamesResponse 
            : (allgamesResponse?.games || []);
          
          console.log("[Watchlist] Extracted games array:", games);
          console.log("All games structure (first game):", games[0]);
          console.log("game _id type:", typeof games[0]?._id, "Value:", games[0]?._id);
          console.log("Looking for game IDs:", gameIds);
          console.log("gameIds types:", gameIds.map(id => typeof id));
          
          const watchlistgames = games.filter((game) => {
            const gameId = game._id || game.gameId || game.id;
            console.log("Comparing gameId:", gameId, "(type:", typeof gameId, ") with watchlist IDs:", gameIds);
            
            // Convert both to strings for comparison (handles ObjectId vs String)
            const gameIdStr = String(gameId);
            const isMatch = gameIds.includes(gameIdStr);
            
            if (isMatch) {
              console.log("[Watchlist] Found matching game:", game.title, "with ID:", gameId);
            } else {
              console.log("[Watchlist] No match for game:", game.title, "ID:", gameId);
            }
            return isMatch;
          });
          console.log("Full watchlist games:", watchlistgames);
          setWatchlist(watchlistgames);
        } else {
          console.error("Unexpected watchlist format:", watchlistItems);
          setWatchlist([]);
        }
      } catch (err) {
        setError("Failed to load watchlist from backend");
        console.error("Error fetching watchlist:", err);

        // Fallback to localStorage
        try {
          console.log("Falling back to localStorage...");
          const localWatchlist = ApiService.getWatchlistLocal(user.id);
          console.log("Local watchlist:", localWatchlist);

          if (localWatchlist.length > 0) {
          const allgamesResponse = await ApiService.getGames();
            const games = Array.isArray(allgamesResponse) 
              ? allgamesResponse 
              : (allgamesResponse?.games || []);
            const watchlistgames = games.filter((game) =>
              localWatchlist.includes(game._id || game.gameId)
            );
            console.log("Local watchlist games:", watchlistgames);
            setWatchlist(watchlistgames);
            setError(null); // Clear error since we found local data
          }
        } catch (localErr) {
          console.error("Local fallback also failed:", localErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [isSignedIn, user]);

  const removeFromWatchlist = async (gameId) => {
    if (!isSignedIn) return;

    try {
      await ApiService.removeFromWatchlist(gameId);
      // Remove from local state using flexible ID matching
      setWatchlist((prev) => prev.filter((game) => {
        const id = game._id || game.gameId || game.id;
        return id !== gameId;
      }));
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      // Fallback to localStorage
      ApiService.removeFromWatchlistLocal(user.id, gameId);
      // Remove from local state using flexible ID matching
      setWatchlist((prev) => prev.filter((game) => {
        const id = game._id || game.gameId || game.id;
        return id !== gameId;
      }));
    }
  };

  const clearWatchlistFn = async () => {
    if (!isSignedIn) return;

    try {
      await ApiService.clearWatchlist();
      setWatchlist([]);
    } catch (error) {
      console.error("Failed to clear watchlist:", error);
      // Fallback to localStorage
      ApiService.clearWatchlistLocal(user.id);
      setWatchlist([]);
    }
  };

  if (!isSignedIn) {
    return (
      <section className="px-4 lg:px-8 py-6">
        <div className="text-center py-12 lg:py-20">
          <div className="text-6xl lg:text-8xl mb-4 lg:mb-6">🔐</div>
          <h2 className="text-2xl lg:text-3xl font-bold theme-text-primary mb-3 lg:mb-4">
            Sign In Required
          </h2>
          <p className="theme-text-secondary text-base lg:text-lg mb-6 lg:mb-8 px-4">
            You need to sign in to view and manage your watchlist
          </p>
                  <SignInButton className="bg-[var(--accent-color)] text-[var(--bg-primary)]  px-6 lg:px-8 py-2 rounded-lg font-semibold hover:bg-[var(--accent-color)] transition-colors touch-target cursor-pointer" />

        </div>
      </section>
    );
  }

  return (
    <section className="px-4 lg:px-8 py-4 lg:py-6 theme-bg-primary">
      <div className="rounded-xl lg:rounded-2xl overflow-hidden shadow-xl lg:shadow-2xl border theme-border relative h-40 sm:h-48 lg:h-56 theme-bg-secondary flex items-center justify-center mb-6 lg:mb-8">
        <div className="relative z-10 text-center px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 tracking-wide theme-accent drop-shadow-lg font-heading">
            📚 My Watchlist
          </h2>
          <p className="theme-text-secondary text-sm sm:text-base lg:text-lg drop-shadow">
            Games you want to play later
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-2xl font-bold theme-text-primary tracking-wide font-heading">
          Your Watchlist ({watchlist.length} Game)
        </h3>
        {watchlist.length > 0 && (
          <button
            onClick={clearWatchlistFn}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm lg:text-base touch-target"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Watchlist Content Area */}
      <div className="min-h-[300px] lg:min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 lg:h-96 theme-accent">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 theme-border-accent mb-3 lg:mb-4"></div>
            <span className="text-lg lg:text-xl font-bold theme-text-primary">Loading your watchlist...</span>
            <span className="text-xs lg:text-sm theme-text-secondary mt-2">Please wait while we fetch your gaming</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-red-400 text-lg lg:text-xl font-bold px-4">
            {error}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-12 lg:py-20">
            <div className="text-6xl lg:text-8xl mb-4 lg:mb-6">📝</div>
            <h3 className="text-2xl lg:text-3xl font-semibold mb-3 lg:mb-4 theme-text-primary">
              Your Watchlist is Empty
            </h3>
            <p className="theme-text-secondary text-base lg:text-lg mb-6 lg:mb-8 px-4">
              Start adding games to your watchlist by clicking the bookmark icon
              on game cards
            </p>
            <div className="theme-bg-secondary theme-border rounded-lg p-4 lg:p-6 max-w-md mx-auto">
              <h4 className="theme-accent font-semibold mb-2 text-sm lg:text-base">💡 Pro Tip:</h4>
              <p className="theme-text-primary text-xs lg:text-sm">
                Browse games and click the 📚 icon to add them to your watchlist
                for later viewing
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {watchlist.map((game, index) => (
              <div key={game._id || game.gameId || game.id || `game-${index}`} className="relative">
                <GameCard game={game} />
                <button
                  onClick={() => removeFromWatchlist(game._id || game.gameId || game.id)}
                  className="absolute top-1 lg:top-2 right-1 lg:right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 lg:p-2 transition-colors z-10 touch-target flex justify-center items-center"
                  title="Remove from watchlist"
                >
                  <svg
                    className="w-3 h-3 lg:w-4 lg:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
