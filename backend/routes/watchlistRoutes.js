import express from "express";
import { requireAuth } from "../middleware/auth.js";
import * as watchlistController from "../controllers/watchlistController.js";

const router = express.Router();

// Apply authentication middleware
router.use(requireAuth());

// Add game to watchlist
router.post("/add", watchlistController.addToWatchlist);

// Remove game from watchlist
router.delete("/:gameId", watchlistController.removeFromWatchlist);

// Get user's watchlist
router.get("/", watchlistController.getUserWatchlist);

// Clear entire watchlist
router.delete("/", watchlistController.clearWatchlist);

// Check if game is in watchlist
router.get("/check/:gameId", watchlistController.checkWatchlistStatus);

// Test endpoint to debug
router.get("/debug", (req, res) => {
  const { userId } = req.userId ? { userId: req.userId } : { userId: null };
  res.json({
    message: "Watchlist debug endpoint",
    userId,
    timestamp: new Date().toISOString(),
  });
});

export default router;
