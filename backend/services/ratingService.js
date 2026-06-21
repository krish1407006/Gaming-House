import Rating from "../models/Rating.js";
import Movie from "../models/Movie.js";
import { updateMovieRatingStats } from "./movieService.js";

export const createOrUpdateRating = async (userId, movieId, ratingData) => {
  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return {
        success: false,
        error: "Movie not found",
      };
    }

    const existingRating = await Rating.findOne({ userId, movieId });

    let rating;
    let isUpdate = false;

    if (existingRating) {
      rating = await Rating.findByIdAndUpdate(
        existingRating._id,
        {
          rating: ratingData.rating,
          review: ratingData.review || "",
          isPublic:
            ratingData.isPublic !== undefined ? ratingData.isPublic : true,
        },
        { new: true, runValidators: true }
      );
      isUpdate = true;
    } else {
      rating = new Rating({
        userId,
        movieId,
        rating: ratingData.rating,
        review: ratingData.review || "",
        isPublic:
          ratingData.isPublic !== undefined ? ratingData.isPublic : true,
      });
      await rating.save();
    }

    await updateMovieRatingStats(movieId);

    return {
      success: true,
      data: rating,
      isUpdate,
    };
  } catch (error) {
    console.error("Error creating/updating rating:", error);
    return {
      success: false,
      error:
        error.name === "ValidationError"
          ? Object.values(error.errors)
              .map((e) => e.message)
              .join(", ")
          : "Failed to save rating",
    };
  }
};

export const getUserRating = async (userId, movieId) => {
  try {
    const rating = await Rating.findOne({ userId, movieId }).lean();

    if (!rating) {
      return {
        success: false,
        error: "Rating not found",
      };
    }

    return {
      success: true,
      data: rating,
    };
  } catch (error) {
    console.error("Error fetching user rating:", error);
    return {
      success: false,
      error: "Failed to fetch rating",
    };
  }
};

export const getUserRatings = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [ratings, totalCount] = await Promise.all([
      Rating.find({ userId })
        .populate("movieId", "title poster releaseDate director")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Rating.countDocuments({ userId }),
    ]);

    return {
      success: true,
      data: {
        ratings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: skip + ratings.length < totalCount,
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    return {
      success: false,
      error: "Failed to fetch ratings",
    };
  }
};

export const getMovieRatings = async (movieId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "helpfulVotes",
      sortOrder = "desc",
      publicOnly = true,
    } = options;

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    sort.createdAt = -1;

    const query = { movieId };
    if (publicOnly) {
      query.isPublic = true;
    }

    const [ratings, totalCount] = await Promise.all([
      Rating.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Rating.countDocuments(query),
    ]);

    return {
      success: true,
      data: {
        ratings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: skip + ratings.length < totalCount,
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching movie ratings:", error);
    return {
      success: false,
      error: "Failed to fetch movie ratings",
    };
  }
};

export const deleteRating = async (userId, movieId) => {
  try {
    const rating = await Rating.findOneAndDelete({ userId, movieId });

    if (!rating) {
      return {
        success: false,
        error: "Rating not found",
      };
    }

    await updateMovieRatingStats(movieId);

    return {
      success: true,
      message: "Rating deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting rating:", error);
    return {
      success: false,
      error: "Failed to delete rating",
    };
  }
};

export const markReviewHelpful = async (userId, ratingId) => {
  try {
    const rating = await Rating.findById(ratingId);

    if (!rating) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    if (rating.helpfulBy.includes(userId)) {
      return {
        success: false,
        error: "You have already marked this review as helpful",
      };
    }

    if (rating.userId === userId) {
      return {
        success: false,
        error: "You cannot mark your own review as helpful",
      };
    }

    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      {
        $push: { helpfulBy: userId },
        $inc: { helpfulVotes: 1 },
      },
      { new: true }
    );

    return {
      success: true,
      data: {
        helpfulVotes: updatedRating.helpfulVotes,
      },
    };
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return {
      success: false,
      error: "Failed to mark review as helpful",
    };
  }
};

export const removeHelpfulMark = async (userId, ratingId) => {
  try {
    const rating = await Rating.findById(ratingId);

    if (!rating) {
      return {
        success: false,
        error: "Review not found",
      };
    }

    if (!rating.helpfulBy.includes(userId)) {
      return {
        success: false,
        error: "You have not marked this review as helpful",
      };
    }

    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      {
        $pull: { helpfulBy: userId },
        $inc: { helpfulVotes: -1 },
      },
      { new: true }
    );

    return {
      success: true,
      data: {
        helpfulVotes: updatedRating.helpfulVotes,
      },
    };
  } catch (error) {
    console.error("Error removing helpful mark:", error);
    return {
      success: false,
      error: "Failed to remove helpful mark",
    };
  }
};

export const getUserRatingStats = async (userId) => {
  try {
    const stats = await Rating.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalRatings: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          totalReviews: {
            $sum: {
              $cond: [
                {
                  $and: [{ $ne: ["$review", ""] }, { $ne: ["$review", null] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalRatings: 0,
      averageRating: 0,
      totalReviews: 0,
    };

    return {
      success: true,
      data: {
        totalRatings: result.totalRatings,
        averageRating: Math.round(result.averageRating * 10) / 10 || 0,
        totalReviews: result.totalReviews,
      },
    };
  } catch (error) {
    console.error("Error fetching user rating stats:", error);
    return {
      success: false,
      error: "Failed to fetch rating statistics",
    };
  }
};
