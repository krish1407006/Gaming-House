import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import Rating from "../models/Rating.js";
import connectDB from "../config/database.js";

async function resetRatings() {
  await connectDB();

  console.log("Resetting all game ratings to 0...");
  const result = await Game.updateMany(
    {},
    { $set: { averageRating: 0, totalRatings: 0 } }
  );
  console.log(`Reset ${result.modifiedCount} games`);

  const actualRatingCounts = await Rating.aggregate([
    {
      $group: {
        _id: "$gameId",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  console.log(`Found ${actualRatingCounts.length} games with real ratings`);

  for (const stat of actualRatingCounts) {
    await Game.findByIdAndUpdate(stat._id, {
      averageRating: Math.round(stat.averageRating * 10) / 10,
      totalRatings: stat.totalRatings,
    });
    console.log(
      `  Updated ${stat._id}: ${Math.round(stat.averageRating * 10) / 10}/10 (${stat.totalRatings} ratings)`
    );
  }

  console.log("\nDone! Only games with actual user ratings will now show non-zero values.");
  process.exit(0);
}

resetRatings();
