import Watchlist from "../models/Watchlist.js";

export const addToWatchlist = async (userId, gameId) => {
  try {
    console.log(
      "Creating watchlist item - userId:",
      userId,
      "gameId:",
      gameId
    );

    const watchlistItem = new Watchlist({
      userId,
      gameId,
    });

    const savedItem = await watchlistItem.save();
    console.log("Saved watchlist item:", savedItem);
    return { success: true, data: savedItem };
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - game already in watchlist
      return { success: false, error: "game already in watchlist" };
    }
    console.error("Error adding to watchlist:", error);
    return { success: false, error: "Failed to add to watchlist" };
  }
};

export const removeFromWatchlist = async (userId, gameId) => {
  try {
    const result = await Watchlist.findOneAndDelete({
      userId,
      gameId,
    });

    if (!result) {
      return { success: false, error: "game not found in watchlist" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return { success: false, error: "Failed to remove from watchlist" };
  }
};

export const getUserWatchlist = async (userId) => {
  try {
    console.log("Getting watchlist for userId:", userId);
    const watchlist = await Watchlist.find({ userId });
    console.log("Found watchlist items:", watchlist.length, watchlist);
    return { success: true, data: watchlist };
  } catch (error) {
    console.error("Error getting user watchlist:", error);
    return { success: false, error: "Failed to get watchlist" };
  }
};

export const clearUserWatchlist = async (userId) => {
  try {
    const result = await Watchlist.deleteMany({ userId });
    return { success: true, data: { deletedCount: result.deletedCount } };
  } catch (error) {
    console.error("Error clearing watchlist:", error);
    return { success: false, error: "Failed to clear watchlist" };
  }
};

export const isInWatchlist = async (userId, gameId) => {
  try {
    const watchlistItem = await Watchlist.findOne({ userId, gameId });
    return { success: true, data: { isInWatchlist: !!watchlistItem } };
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return { success: false, error: "Failed to check watchlist" };
  }
};
