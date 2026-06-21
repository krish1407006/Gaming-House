import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    review: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulBy: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

ratingSchema.index({ movieId: 1, userId: 1 }, { unique: true });

ratingSchema.index({ movieId: 1 });
ratingSchema.index({ userId: 1 });
ratingSchema.index({ rating: -1 });
ratingSchema.index({ createdAt: -1 });
ratingSchema.index({ helpfulVotes: -1 });

export default mongoose.model("Rating", ratingSchema);
