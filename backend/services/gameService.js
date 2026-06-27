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

    const [games, totalCount] = await Promise.all([
      Game.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Game.countDocuments(query),
    ]);

    return {
      success: true,
      data: {
        games,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: skip + games.length < totalCount,
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching games:", error);
    return {
      success: false,
      error: "Failed to fetch games",
    };
  }
};

export const getGameById = async (movieId, includeReviews = true) => {
  try {
    const game = await Game.findById(movieId).lean();

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    let reviews = [];
    if (includeReviews) {
      reviews = await Rating.find({
        gameId: movieId,
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
        ...game,
        reviews,
      },
    };
  } catch (error) {
    console.error("Error fetching game:", error);
    return {
      success: false,
      error: "Failed to fetch game",
    };
  }
};

export const createGame = async (movieData, adminUserId) => {
  try {
    const game = new Game({
      ...movieData,
      addedBy: adminUserId,
    });

    const savedGame = await game.save();

    return {
      success: true,
      data: savedGame,
    };
  } catch (error) {
    console.error("Error creating game:", error);
    return {
      success: false,
      error:
        error.name === "ValidationError"
          ? Object.values(error.errors)
              .map((e) => e.message)
              .join(", ")
          : "Failed to create game",
    };
  }
};

export const updateGame = async (movieId, updateData) => {
  try {
    const { averageRating, totalRatings, addedBy, ...validUpdateData } =
      updateData;

    const game = await Game.findByIdAndUpdate(movieId, validUpdateData, {
      new: true,
      runValidators: true,
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    return {
      success: true,
      data: game,
    };
  } catch (error) {
    console.error("Error updating game:", error);
    return {
      success: false,
      error:
        error.name === "ValidationError"
          ? Object.values(error.errors)
              .map((e) => e.message)
              .join(", ")
          : "Failed to update game",
    };
  }
};

export const deleteGame = async (movieId) => {
  try {
    const game = await Game.findByIdAndDelete(movieId);

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    await Rating.deleteMany({ gameId: movieId });

    return {
      success: true,
      message: "Game and associated ratings deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting game:", error);
    return {
      success: false,
      error: "Failed to delete game",
    };
  }
};

export const toggleGameStatus = async (movieId, isActive) => {
  try {
    const game = await Game.findByIdAndUpdate(
      movieId,
      { isActive },
      { new: true }
    );

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    return {
      success: true,
      data: game,
    };
  } catch (error) {
    console.error("Error toggling game status:", error);
    return {
      success: false,
      error: "Failed to update game status",
    };
  }
};

export const toggleGameFeatured = async (movieId, featured) => {
  try {
    const game = await Game.findByIdAndUpdate(
      movieId,
      { featured },
      { new: true }
    );

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    return {
      success: true,
      data: game,
    };
  } catch (error) {
    console.error("Error toggling game featured status:", error);
    return {
      success: false,
      error: "Failed to update game featured status",
    };
  }
};

export const getTrendingGames = async () => {
  try {
    const games = await Game.find({
      isActive: true,
      trending: true,
    })
      .sort({ trendingPosition: 1, trendingScore: -1 })
      .limit(50)
      .lean();

    return {
      success: true,
      data: games,
    };
  } catch (error) {
    console.error("Error fetching trending games:", error);
    return {
      success: false,
      error: "Failed to fetch trending games",
    };
  }
};

export const getAdminTrendingGames = async () => {
  try {
    const allGames = await Game.find({ isActive: true })
      .select("title poster director year releaseDate averageRating totalRatings trending trendingPosition trendingScore featured")
      .sort({ trendingPosition: 1, title: 1 })
      .lean();

    const trending = allGames.filter(g => g.trending);
    const notTrending = allGames.filter(g => !g.trending);

    return {
      success: true,
      data: { trending, notTrending },
    };
  } catch (error) {
    console.error("Error fetching admin trending data:", error);
    return {
      success: false,
      error: "Failed to fetch trending data",
    };
  }
};

export const toggleGameTrending = async (movieId, trending) => {
  try {
    let update = { trending };
    if (trending) {
      const maxPos = await Game.findOne({ trending: true })
        .sort({ trendingPosition: -1 })
        .select("trendingPosition")
        .lean();
      update.trendingPosition = (maxPos?.trendingPosition || 0) + 1;
    } else {
      update.trendingPosition = 0;
    }

    const game = await Game.findByIdAndUpdate(movieId, update, { new: true });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    return {
      success: true,
      data: game,
    };
  } catch (error) {
    console.error("Error toggling game trending status:", error);
    return {
      success: false,
      error: "Failed to update game trending status",
    };
  }
};

export const autoSetTrending = async () => {
  try {
    const games = await Game.find({ isActive: true }).lean();

    const scores = games.map((game) => {
      const ratingWeight = (game.averageRating || 0) * 5;
      const ratingsWeight = Math.min(game.totalRatings || 0, 100);
      const ageMs = Date.now() - new Date(game.createdAt || game._id.getTimestamp()).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const recencyWeight = Math.max(0, 30 - ageDays) / 30 * 3;

      const trendingScore = Math.round((ratingWeight + ratingsWeight + recencyWeight) * 10) / 10;
      return { _id: game._id, trendingScore };
    });

    scores.sort((a, b) => b.trendingScore - a.trendingScore);
    const topLimit = Math.min(20, scores.length);
    const topIds = new Set(scores.slice(0, topLimit).map((s) => s._id.toString()));

    const updates = scores.map((s) => ({
      updateOne: {
        filter: { _id: s._id },
        update: {
          $set: {
            trending: topIds.has(s._id.toString()),
            trendingScore: s.trendingScore,
          },
        },
      },
    }));

    await Game.bulkWrite(updates);

    return {
      success: true,
      data: {
        trendingCount: topLimit,
        message: `${topLimit} games set as trending automatically`,
      },
    };
  } catch (error) {
    console.error("Error auto-setting trending games:", error);
    return {
      success: false,
      error: "Failed to auto-set trending games",
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
    console.error("Error fetching game stats:", error);
    return {
      success: false,
      error: "Failed to fetch game statistics",
    };
  }
};

export const updateGameRatingStats = async (movieId) => {
  try {
    const stats = await Rating.aggregate([
      { $match: { gameId: new mongoose.Types.ObjectId(movieId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const { averageRating = 0, totalRatings = 0 } = stats[0] || {};

    const game = await Game.findByIdAndUpdate(
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
        averageRating: game.averageRating,
        totalRatings: game.totalRatings,
      },
    };
  } catch (error) {
    console.error("Error updating game rating stats:", error);
    return {
      success: false,
      error: "Failed to update rating statistics",
    };
  }
};
