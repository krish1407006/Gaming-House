import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { checkAdmin } from "../middleware/admin.js";
import * as gameController from "../controllers/gameController.js";
import * as downloadController from "../controllers/downloadController.js";

const router = express.Router();

const cachePublic = (_req, res, next) => {
  res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=600");
  next();
};

// Public routes (no authentication required)
router.get("/", cachePublic, gameController.getGames);
router.get("/trending", cachePublic, gameController.getTrendingGames);
router.get("/homepage", cachePublic, gameController.getHomepageGames);
router.get("/:id", cachePublic, gameController.getGameById);
router.get("/:id/ratings", cachePublic, gameController.getGameRatings);

// Public download routes
router.get("/:id/downloads", cachePublic, downloadController.getGameDownloads);

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
