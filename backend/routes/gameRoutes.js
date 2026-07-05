import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { checkAdmin } from "../middleware/admin.js";
import * as gameController from "../controllers/gameController.js";
import * as downloadController from "../controllers/downloadController.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", gameController.getGames);
router.get("/trending", gameController.getTrendingGames);
router.get("/homepage", gameController.getHomepageGames);
router.get("/:id", gameController.getGameById);
router.get("/:id/ratings", gameController.getGameRatings);

// Public download routes
router.get("/:id/downloads", downloadController.getGameDownloads);

// User routes (authentication required)
router.post("/:id/rate", requireAuth(), gameController.rateGame);
router.delete("/:id/rate", requireAuth(), gameController.deleteGameRating);
router.post(
  "/ratings/:ratingId/helpful",
  requireAuth(),
  gameController.markReviewHelpful
);
router.delete(
  "/ratings/:ratingId/helpful",
  requireAuth(),
  gameController.removeHelpfulMark
);

export default router;
