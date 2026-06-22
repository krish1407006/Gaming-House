import mongoose from "mongoose";
import Game from "../models/Game.js";
import Rating from "../models/Rating.js";

export const getGames = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 100,
      genre,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      activeOnly = true,
      featuredOnly = false,
    } = options;

    const skip = (page - 1) * limit;

    const query = {};

    if (activeOnly) {
      query.isActive = true;
    }

    if (featuredOnly) {
      query.featured = true;
    }

    if (genre) {
      query.genre = { $in: [genre] };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [movies, totalCount] = await Promise.all([
      Game.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Game.countDocuments(query),
    ]);

    return {
      success: true,
      data: {
        movies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: skip + movies.length < totalCount,
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching movies:", error);
    return {
      success: false,
      error: "Failed to fetch movies",
    };
  }
};

export const getGameById = async (movieId, includeReviews = true) => {
  try {
    const movie = await Game.findById(movieId).lean();

    if (!movie) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    let reviews = [];
    if (includeReviews) {
      reviews = await Rating.find({
        movieId: movieId,
        isPublic: true,
        review: { $exists: true, $ne: "" },
      })
        .sort({ helpfulVotes: -1, createdAt: -1 })
        .limit(10)
        .lean();
    }

    return {
      success: true,
      data: {
        ...movie,
        reviews,
      },
    };
  } catch (error) {
    console.error("Error fetching movie:", error);
    return {
      success: false,
      error: "Failed to fetch movie",
    };
  }
};

export const createGame = async (movieData, adminUserId) => {
  try {
    const movie = new Game({
      ...movieData,
      addedBy: adminUserId,
    });

    const savedGame = await movie.save();

    return {
      success: true,
      data: savedGame,
    };
  } catch (error) {
    console.error("Error creating movie:", error);
    return {
      success: false,
      error:
        error.name === "ValidationError"
          ? Object.values(error.errors)
              .map((e) => e.message)
              .join(", ")
          : "Failed to create movie",
    };
  }
};

export const updateGame = async (movieId, updateData) => {
  try {
    const { averageRating, totalRatings, addedBy, ...validUpdateData } =
      updateData;

    const movie = await Game.findByIdAndUpdate(movieId, validUpdateData, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    return {
      success: true,
      data: movie,
    };
  } catch (error) {
    console.error("Error updating movie:", error);
    return {
      success: false,
      error:
        error.name === "ValidationError"
          ? Object.values(error.errors)
              .map((e) => e.message)
              .join(", ")
          : "Failed to update movie",
    };
  }
};

export const deleteGame = async (movieId) => {
  try {
    const movie = await Game.findByIdAndDelete(movieId);

    if (!movie) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    await Rating.deleteMany({ movieId });

    return {
      success: true,
      message: "Game and associated ratings deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting movie:", error);
    return {
      success: false,
      error: "Failed to delete movie",
    };
  }
};

export const toggleGameStatus = async (movieId, isActive) => {
  try {
    const movie = await Game.findByIdAndUpdate(
      movieId,
      { isActive },
      { new: true }
    );

    if (!movie) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    return {
      success: true,
      data: movie,
    };
  } catch (error) {
    console.error("Error toggling movie status:", error);
    return {
      success: false,
      error: "Failed to update movie status",
    };
  }
};

export const toggleGameFeatured = async (movieId, featured) => {
  try {
    const movie = await Game.findByIdAndUpdate(
      movieId,
      { featured },
      { new: true }
    );

    if (!movie) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    return {
      success: true,
      data: movie,
    };
  } catch (error) {
    console.error("Error toggling movie featured status:", error);
    return {
      success: false,
      error: "Failed to update movie featured status",
    };
  }
};

export const getGameStats = async () => {
  try {
    const [
      totalGames,
      activeGames,
      featuredGames,
      totalRatings,
      avgRatingOverall,
    ] = await Promise.all([
      Game.countDocuments(),
      Game.countDocuments({ isActive: true }),
      Game.countDocuments({ featured: true }),
      Rating.countDocuments(),
      Rating.aggregate([
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]),
    ]);

    return {
      success: true,
      data: {
        totalGames,
        activeGames,
        featuredGames,
        totalRatings,
        averageRatingOverall: avgRatingOverall[0]?.avgRating || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching movie stats:", error);
    return {
      success: false,
      error: "Failed to fetch movie statistics",
    };
  }
};

export const updateGameRatingStats = async (movieId) => {
  try {
    const stats = await Rating.aggregate([
      { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const { averageRating = 0, totalRatings = 0 } = stats[0] || {};

    const movie = await Game.findByIdAndUpdate(
      movieId,
      {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings,
      },
      { new: true }
    );

    return {
      success: true,
      data: {
        averageRating: movie.averageRating,
        totalRatings: movie.totalRatings,
      },
    };
  } catch (error) {
    console.error("Error updating movie rating stats:", error);
    return {
      success: false,
      error: "Failed to update rating statistics",
    };
  }
};
