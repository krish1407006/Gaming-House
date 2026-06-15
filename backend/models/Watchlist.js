import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    movieId: {
      type: String,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique user-movie combinations
watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model("Watchlist", watchlistSchema);
