import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    director: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    cast: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],
    genre: [
      {
        type: String,
        enum: [
          "Action",
          "Adventure",
          "Animation",
          "Biography",
          "Comedy",
          "Crime",
          "Documentary",
          "Drama",
          "Family",
          "Fantasy",
          "History",
          "Horror",
          "Music",
          "Mystery",
          "Romance",
          "Sci-Fi",
          "Sport",
          "Thriller",
          "War",
          "Western",
        ],
      },
    ],
    releaseDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    poster: {
      type: String,
      trim: true,
    },
    trailer: {
      type: String,
      trim: true,
    },
    imdbId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    budget: {
      type: Number,
      min: 0,
    },
    boxOffice: {
      type: Number,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
    addedBy: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index(
  { title: "text", description: "text", director: "text" },
  { default_language: "none" }
);
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ averageRating: -1 });
movieSchema.index({ isActive: 1 });
movieSchema.index({ featured: -1 });

export default mongoose.model("Movie", movieSchema);
