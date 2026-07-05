import mongoose from "mongoose";
import Game from "../models/Game.js";
import Rating from "../models/Rating.js";

export const getGames = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 200,
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

    if (options.ids) {
      query._id = { $in: options.ids.map(id => new mongoose.Types.ObjectId(id)) };
    }

    if (genre) {
      query.genre = { $in: [genre] };
    }

    if (search) {
      query.$text = { $search: search };
    }

    let games;

    if (sortBy === "random") {
      games = await Game.aggregate([
        { $match: query },
        { $sample: { size: parseInt(limit) } },
        {
          $project: {
            title: 1, poster: 1, description: 1, director: 1,
            releaseDate: 1, duration: 1, language: 1, country: 1,
            genre: 1, budget: 1, boxOffice: 1, trailer: 1,
            backdrop: 1, screenshots: 1, cast: 1,
            averageRating: 1, totalRatings: 1, isActive: 1,
            featured: 1, trending: 1, createdAt: 1,
            steamAppId: 1,
          },
        },
      ]);
      const dlData2 = await mongoose.model('Download').aggregate([
        { $group: { _id: '$game', count: { $sum: 1 } } },
      ]);
      const dlMap2 = {};
      for (const d of dlData2) dlMap2[d._id.toString()] = d.count;
      games = games.map(g => ({ ...g, downloadsCount: dlMap2[g._id.toString()] || 0 }));
    } else {
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const listQuery = Game.find(query)
        .select("title poster description director releaseDate duration language country genre budget boxOffice trailer backdrop screenshots cast averageRating totalRatings isActive featured trending createdAt steamAppId")
        .sort(sort).skip(skip).limit(parseInt(limit)).lean();

      const [found, totalCount, downloadData] = await Promise.all([
        listQuery,
        Game.countDocuments(query),
        mongoose.model('Download').aggregate([
          { $group: { _id: '$game', count: { $sum: 1 } } },
        ]),
      ]);
      games = found;
      const dlMap = {};
      for (const d of downloadData) dlMap[d._id.toString()] = d.count;
      games = games.map(g => ({ ...g, downloadsCount: dlMap[g._id.toString()] || 0 }));

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
    }

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

export const updateGame = async (gameId, updateData) => {
  try {
    const { averageRating, totalRatings, addedBy, ...validUpdateData } =
      updateData;

    const game = await Game.findByIdAndUpdate(gameId, validUpdateData, {
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
        .sort({ trendingPosition: 1, trendingScore: -1 })
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
      // Page 1: admin-curated games
      const games = await Game.find({
        isActive: true,
        showOnHomepage: true,
      })
        .sort({ homepagePosition: 1 })
        .select("title poster description director releaseDate duration language country genre budget boxOffice trailer backdrop screenshots cast averageRating totalRatings isActive featured trending createdAt")
        .lean();

      const totalCurated = games.length;

      return {
        success: true,
        data: {
          games,
          pagination: {
            currentPage: 1,
            totalPages: Math.ceil((await Game.countDocuments({ isActive: true })) / limit),
            totalCurated,
          },
        },
      };
    } else {
      // Pages 2+: all games NOT on homepage, paginated
      const skip = (page - 1) * limit;

      const [games, totalCount] = await Promise.all([
        Game.find({ isActive: true, showOnHomepage: false })
          .select("title poster description director releaseDate duration language country genre budget boxOffice trailer backdrop screenshots cast averageRating totalRatings isActive featured trending createdAt")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Game.countDocuments({ isActive: true, showOnHomepage: false }),
      ]);

      // Include curated count so frontend can offset page numbering
      const curatedCount = await Game.countDocuments({ isActive: true, showOnHomepage: true });

      return {
        success: true,
        data: {
          games,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil((totalCount + curatedCount) / limit),
            totalCurated: curatedCount,
          },
        },
      };
    }
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
