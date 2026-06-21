import { getAuth } from "@clerk/express";
import * as movieService from "../services/movieService.js";
import * as ratingService from "../services/ratingService.js";

export const getMovies = async (req, res) => {
  try {
    const { page, limit, genre, search, sortBy, sortOrder, featured } =
      req.query;

    const result = await movieService.getMovies({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      genre,
      search,
      sortBy,
      sortOrder,
      activeOnly: true,
      featuredOnly: featured === "true",
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in getMovies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = getAuth(req);

    const result = await movieService.getMovieById(id, true);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    // Check if movie is active (unless user is admin)
    if (!result.data.isActive && !req.isAdmin) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // If user is authenticated, get their rating for this movie
    let userRating = null;
    if (userId) {
      const userRatingResult = await ratingService.getUserRating(userId, id);
      if (userRatingResult.success) {
        userRating = userRatingResult.data;
      }
    }

    res.json({
      ...result.data,
      userRating,
    });
  } catch (error) {
    console.error("Error in getMovieById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMovieRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const movieResult = await movieService.getMovieById(id, false);
    if (!movieResult.success) {
      return res.status(404).json({ error: "Movie not found" });
    }

    if (!movieResult.data.isActive && !req.isAdmin) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const result = await ratingService.getMovieRatings(id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder,
      publicOnly: true,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in getMovieRatings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const rateMovie = async (req, res) => {
  try {
    const { id: movieId } = req.params;
    const { userId } = getAuth(req);
    const { rating, review, isPublic } = req.body;

    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({
        error: "Rating must be between 1 and 10",
      });
    }

    const movieResult = await movieService.getMovieById(movieId, false);
    if (!movieResult.success) {
      return res.status(404).json({ error: "Movie not found" });
    }

    if (!movieResult.data.isActive) {
      return res.status(400).json({ error: "Cannot rate inactive movie" });
    }

    const result = await ratingService.createOrUpdateRating(userId, movieId, {
      rating: parseInt(rating),
      review: review?.trim(),
      isPublic,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(result.isUpdate ? 200 : 201).json({
      message: result.isUpdate
        ? "Rating updated successfully"
        : "Rating created successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in rateMovie:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMovieRating = async (req, res) => {
  try {
    const { id: movieId } = req.params;
    const { userId } = getAuth(req);

    const result = await ratingService.deleteRating(userId, movieId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("Error in deleteMovieRating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markReviewHelpful = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { userId } = getAuth(req);

    const result = await ratingService.markReviewHelpful(userId, ratingId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: "Review marked as helpful",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in markReviewHelpful:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeHelpfulMark = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { userId } = getAuth(req);

    const result = await ratingService.removeHelpfulMark(userId, ratingId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: "Helpful mark removed",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in removeHelpfulMark:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
