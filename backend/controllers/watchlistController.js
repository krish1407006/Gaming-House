import { getAuth } from "@clerk/express";
import * as watchlistService from "../services/watchlistService.js";

export const addToWatchlist = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { movieId } = req.body;

    console.log("Add to watchlist - userId:", userId, "movieId:", movieId);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!movieId) {
      return res.status(400).json({ error: "Movie ID is required" });
    }

    const result = await watchlistService.addToWatchlist(userId, movieId);

    if (!result.success) {
      if (result.error === "Movie already in watchlist") {
        return res.status(409).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    res.status(201).json({
      message: "Movie added to watchlist",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in addToWatchlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { movieId } = req.params;

    const result = await watchlistService.removeFromWatchlist(userId, movieId);

    if (!result.success) {
      if (result.error === "Movie not found in watchlist") {
        return res.status(404).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: "Movie removed from watchlist",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in removeFromWatchlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserWatchlist = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    console.log("Get watchlist - userId:", userId);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const result = await watchlistService.getUserWatchlist(userId);
    console.log("Watchlist result:", result);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in getUserWatchlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const clearWatchlist = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const result = await watchlistService.clearUserWatchlist(userId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: "Watchlist cleared successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in clearWatchlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkWatchlistStatus = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { movieId } = req.params;

    const result = await watchlistService.isInWatchlist(userId, movieId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in checkWatchlistStatus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
