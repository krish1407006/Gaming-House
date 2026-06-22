import express from "express";
import { requireAuth } from "@clerk/express";
import { checkAdmin } from "../middleware/admin.js";
import * as gameController from "../controllers/gameController.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", gameController.getMovies);
router.get("/:id", gameController.getMovieById);
router.get("/:id/ratings", gameController.getMovieRatings);

// User routes (authentication required)
router.post("/:id/rate", requireAuth(), gameController.rateMovie);
router.delete("/:id/rate", requireAuth(), gameController.deleteMovieRating);
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
