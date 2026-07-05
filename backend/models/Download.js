import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["piracy"],
      default: "piracy",
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

downloadSchema.index({ gameId: 1, isActive: -1 });

export default mongoose.model("Download", downloadSchema);
