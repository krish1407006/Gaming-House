import express from "express";
import { requireAuth } from "@clerk/express";
import { checkAdmin } from "../middleware/admin.js";
import * as movieController from "../controllers/movieController.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovieById);
router.get("/:id/ratings", movieController.getMovieRatings);

// User routes (authentication required)
router.post("/:id/rate", requireAuth(), movieController.rateMovie);
router.delete("/:id/rate", requireAuth(), movieController.deleteMovieRating);
router.post(
  "/ratings/:ratingId/helpful",
  requireAuth(),
  movieController.markReviewHelpful
);
router.delete(
  "/ratings/:ratingId/helpful",
  requireAuth(),
  movieController.removeHelpfulMark
);

export default router;
