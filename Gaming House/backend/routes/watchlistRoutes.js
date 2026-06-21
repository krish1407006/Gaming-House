import express from "express";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import * as watchlistController from "../controllers/watchlistController.js";

const router = express.Router();

// Apply Clerk authentication middleware
router.use(clerkMiddleware());
router.use(requireAuth());

// Add movie to watchlist
router.post("/add", watchlistController.addToWatchlist);

// Remove movie from watchlist
router.delete("/:movieId", watchlistController.removeFromWatchlist);

// Get user's watchlist
router.get("/", watchlistController.getUserWatchlist);

// Clear entire watchlist
router.delete("/", watchlistController.clearWatchlist);

// Check if movie is in watchlist
router.get("/check/:movieId", watchlistController.checkWatchlistStatus);

// Test endpoint to debug
router.get("/debug", (req, res) => {
  const { userId } = require("@clerk/express").getAuth(req);
  res.json({
    message: "Watchlist debug endpoint",
    userId,
    timestamp: new Date().toISOString(),
  });
});

export default router;
