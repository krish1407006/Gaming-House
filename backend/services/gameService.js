import mongoose from "mongoose";
import Game from "../models/Game.js";
import Rating from "../models/Rating.js";

const LISTING_FIELDS = "title poster description releaseDate averageRating totalRatings genre updatedAt";

function buildSort(sortBy = "createdAt", sortOrder = "desc") {
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  if (sortBy !== "_id") {
    sort._id = 1;
  }
  return sort;
}

const VALID_GENRES = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
  "Music", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western",
];

export function sanitizeGameUpdateData(updateData = {}) {
  const {
    averageRating,
    totalRatings,
    addedBy,
    _id,
    __v,
    createdAt,
    updatedAt,
    reviews,
    userRating,
    ...rest
  } = updateData;

  const sanitized = { ...rest };

  if (sanitized.releaseDate) {
    const parsed = new Date(sanitized.releaseDate);
    if (!Number.isNaN(parsed.getTime())) {
      sanitized.releaseDate = parsed;
    } else {
      delete sanitized.releaseDate;
    }
  }

  if (Array.isArray(sanitized.genre)) {
    sanitized.genre = sanitized.genre.filter((g) => VALID_GENRES.includes(g));
  }

  for (const key of ["duration", "budget", "boxOffice", "steamAppId"]) {
    if (sanitized[key] !== undefined) {
      const num = Number(sanitized[key]);
      if (Number.isNaN(num)) {
        delete sanitized[key];
      } else {
        sanitized[key] = num;
      }
    }
  }

  for (const key of [
    "poster",
    "backdrop",
    "trailer",
    "publisher",
    "director",
    "language",
    "country",
  ]) {
    if (sanitized[key] === "" || sanitized[key] == null) {
      delete sanitized[key];
    }
  }

  if (Array.isArray(sanitized.screenshots) && sanitized.screenshots.length === 0) {
    delete sanitized.screenshots;
  }

  if (Array.isArray(sanitized.cast) && sanitized.cast.length === 0) {
    delete sanitized.cast;
  }

  if (Array.isArray(sanitized.highlights) && sanitized.highlights.length === 0) {
    delete sanitized.highlights;
  }

  return sanitized;
}

let totalActiveCount = null;
let totalActiveCountTime = 0;
const COUNT_CACHE_TTL = 60000;

async function getTotalActiveCount() {
  const now = Date.now();
  if (totalActiveCount !== null && now - totalActiveCountTime < COUNT_CACHE_TTL) {
    return totalActiveCount;
  }
  totalActiveCount = await Game.countDocuments({ isActive: true });
  totalActiveCountTime = now;
  return totalActiveCount;
}

export const getGames = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      genre,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      activeOnly = true,
      featuredOnly = false,
      includeAllFields = false,
    } = options;

    const skip = (page - 1) * limit;

    const query = {};

    if (activeOnly) query.isActive = true;
    if (featuredOnly) query.featured = true;

    if (options.ids) {
      query._id = { $in: options.ids.map(id => new mongoose.Types.ObjectId(id)) };
    }

    if (genre) query.genre = { $in: [genre] };

    if (search) query.$text = { $search: search };

    if (sortBy === "random") {
      const games = await Game.aggregate([
        { $match: query },
        { $sample: { size: parseInt(limit) } },
        { $project: { title: 1, poster: 1, description: 1, releaseDate: 1, averageRating: 1, totalRatings: 1, genre: 1 } },
      ]);

      return {
        success: true,
        data: {
          games,
          pagination: {
            currentPage: parseInt(page),
            totalPages: 1,
            totalCount: games.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
    }

    let queryBuilder = Game.find(query).sort(buildSort(sortBy, sortOrder)).skip(skip).limit(parseInt(limit));
    if (!includeAllFields) {
      queryBuilder = queryBuilder.select(LISTING_FIELDS);
    }

    const [found, totalCount] = await Promise.all([
      queryBuilder.lean(),
      Game.countDocuments(query),
    ]);

    return {
      success: true,
      data: {
        games: found,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: skip + found.length < totalCount,
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

export const getGameById = async (gameId, includeReviews = true) => {
  try {
    const game = await Game.findById(gameId).lean();

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    let reviews = [];
    if (includeReviews) {
      reviews = await Rating.find({
        gameId: gameId,
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

export const createGame = async (gameData, adminUserId) => {
  try {
    const game = new Game({
      ...gameData,
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

export const updateGame = async (gameId, updateData) => {
  try {
    const validUpdateData = sanitizeGameUpdateData(updateData);

    if (Object.keys(validUpdateData).length === 0) {
      return {
        success: false,
        error: "No valid fields to update",
      };
    }

    const game = await Game.findByIdAndUpdate(
      gameId,
      { $set: validUpdateData },
      {
        new: true,
        runValidators: true,
      }
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

export const deleteGame = async (gameId) => {
  try {
    const game = await Game.findByIdAndDelete(gameId);

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    await Rating.deleteMany({ gameId: gameId });

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

export const toggleGameStatus = async (gameId, isActive) => {
  try {
    const game = await Game.findByIdAndUpdate(
      gameId,
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

export const toggleGameFeatured = async (gameId, featured) => {
  try {
    const game = await Game.findByIdAndUpdate(
      gameId,
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

export const getTrendingGames = async (options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const query = { isActive: true, trending: true };

    const [games, totalCount] = await Promise.all([
      Game.find(query)
        .select(LISTING_FIELDS)
        .sort({ trendingPosition: 1, trendingScore: -1, _id: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
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

export const toggleGameTrending = async (gameId, trending) => {
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

    const game = await Game.findByIdAndUpdate(gameId, update, { new: true });

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

    const scored = games.map((game) => {
      const ratingWeight = (game.averageRating || 0) * 5;
      const ratingsWeight = Math.min(game.totalRatings || 0, 100);
      const ageMs = Date.now() - new Date(game.createdAt || game._id.getTimestamp()).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      const recencyWeight = Math.max(0, 30 - ageDays) / 30 * 3;

      const trendingScore = Math.round((ratingWeight + ratingsWeight + recencyWeight) * 10) / 10;
      return { _id: game._id, trendingScore };
    });

    scored.sort((a, b) => b.trendingScore - a.trendingScore);
    const topLimit = Math.min(20, scored.length);

    const updates = scored.map((s, i) => ({
      updateOne: {
        filter: { _id: s._id },
        update: {
          $set: {
            trending: i < topLimit,
            trendingPosition: i < topLimit ? i + 1 : 0,
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

export const reorderTrending = async (orderedIds) => {
  try {
    const updates = orderedIds.map((id, i) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            trending: true,
            trendingPosition: i + 1,
          },
        },
      },
    }));

    await Game.bulkWrite(updates);

    await Game.updateMany(
      { _id: { $nin: orderedIds } },
      { $set: { trending: false, trendingPosition: 0 } }
    );

    return {
      success: true,
      data: {
        message: "Trending order updated successfully",
        count: orderedIds.length,
      },
    };
  } catch (error) {
    console.error("Error reordering trending games:", error);
    return {
      success: false,
      error: "Failed to reorder trending games",
    };
  }
};

// ─── Homepage management ───

export const getHomepageGames = async (page = 1, limit = 20) => {
  try {
    if (page === 1) {
      const [games, totalCurated, totalAllActive] = await Promise.all([
        Game.find({ isActive: true, showOnHomepage: true })
          .sort({ homepagePosition: 1 })
          .limit(limit)
          .select(LISTING_FIELDS)
          .lean(),
        Game.countDocuments({ isActive: true, showOnHomepage: true }),
        getTotalActiveCount(),
      ]);

      return {
        success: true,
        data: {
          games,
          pagination: {
            currentPage: 1,
            totalPages: Math.ceil(totalAllActive / limit) || 1,
            totalCurated,
          },
        },
      };
    }

    const skip = (page - 2) * limit;

    const [games, totalCount, curatedCount] = await Promise.all([
      Game.find({ isActive: true, showOnHomepage: false })
        .select(LISTING_FIELDS)
        .sort({ createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Game.countDocuments({ isActive: true, showOnHomepage: false }),
      Game.countDocuments({ isActive: true, showOnHomepage: true }),
    ]);

    return {
      success: true,
      data: {
        games,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((totalCount + curatedCount) / limit) || 1,
          totalCurated: curatedCount,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching homepage games:", error);
    return {
      success: false,
      error: "Failed to fetch homepage games",
    };
  }
};

export const getAdminHomepageGames = async () => {
  try {
    const allGames = await Game.find({ isActive: true })
      .select("title poster director year releaseDate averageRating totalRatings showOnHomepage homepagePosition")
      .sort({ homepagePosition: 1, title: 1 })
      .lean();

    const onHomepage = allGames.filter(g => g.showOnHomepage);
    const notOnHomepage = allGames.filter(g => !g.showOnHomepage);

    return {
      success: true,
      data: { onHomepage, notOnHomepage },
    };
  } catch (error) {
    console.error("Error fetching admin homepage data:", error);
    return {
      success: false,
      error: "Failed to fetch homepage data",
    };
  }
};

export const toggleHomepageGame = async (gameId, showOnHomepage) => {
  try {
    let update = { showOnHomepage };
    if (showOnHomepage) {
      const maxPos = await Game.findOne({ showOnHomepage: true })
        .sort({ homepagePosition: -1 })
        .select("homepagePosition")
        .lean();
      update.homepagePosition = (maxPos?.homepagePosition || 0) + 1;
    } else {
      update.homepagePosition = 0;
    }

    const game = await Game.findByIdAndUpdate(gameId, update, { new: true });

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
    console.error("Error toggling game homepage status:", error);
    return {
      success: false,
      error: "Failed to update game homepage status",
    };
  }
};

export const reorderHomepage = async (orderedIds) => {
  try {
    const updates = orderedIds.map((id, i) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            showOnHomepage: true,
            homepagePosition: i + 1,
          },
        },
      },
    }));

    await Game.bulkWrite(updates);

    await Game.updateMany(
      { _id: { $nin: orderedIds } },
      { $set: { showOnHomepage: false, homepagePosition: 0 } }
    );

    return {
      success: true,
      data: {
        message: "Homepage order updated successfully",
        count: orderedIds.length,
      },
    };
  } catch (error) {
    console.error("Error reordering homepage games:", error);
    return {
      success: false,
      error: "Failed to reorder homepage games",
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

export const updateGameRatingStats = async (gameId) => {
  try {
    const stats = await Rating.aggregate([
      { $match: { gameId: new mongoose.Types.ObjectId(gameId) } },
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
      gameId,
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
