import { getAuth } from "@clerk/express";
import * as gameService from "../services/gameService.js";
import * as ratingService from "../services/ratingService.js";

export const getGames = async (req, res) => {
  try {
    const { page, limit, genre, search, sortBy, sortOrder, featured } =
      req.query;

    const result = await gameService.getGames({
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
    console.error("Error in getGames:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTrendingGames = async (req, res) => {
  try {
    const result = await gameService.getTrendingGames();

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ games: result.data });
  } catch (error) {
    console.error("Error in getTrendingGames:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = getAuth(req);

    const result = await gameService.getGameById(id, true);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    // Check if game is active (unless user is admin)
    if (!result.data.isActive && !req.isAdmin) {
      return res.status(404).json({ error: "game not found" });
    }

    // If user is authenticated, get their rating for this game
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
    console.error("Error in getGameById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGameRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const movieResult = await gameService.getGameById(id, false);
    if (!movieResult.success) {
      return res.status(404).json({ error: "game not found" });
    }

    if (!movieResult.data.isActive && !req.isAdmin) {
      return res.status(404).json({ error: "game not found" });
    }

    const result = await ratingService.getGameRatings(id, {
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
    console.error("Error in getGameRatings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const rateGame = async (req, res) => {
  try {
    const { id: movieId } = req.params;
    const { userId } = getAuth(req);
    const { rating, review, isPublic } = req.body;

    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({
        error: "Rating must be between 1 and 10",
      });
    }

    const movieResult = await gameService.getGameById(movieId, false);
    if (!movieResult.success) {
      return res.status(404).json({ error: "game not found" });
    }

    if (!movieResult.data.isActive) {
      return res.status(400).json({ error: "Cannot rate inactive game" });
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
    console.error("Error in rateGame:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteGameRating = async (req, res) => {
  try {
    const { id: movieId } = req.params;
    const { userId } = getAuth(req);

    const result = await ratingService.deleteRating(userId, movieId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("Error in deleteGameRating:", error);
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
