import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDataDir = path.resolve(__dirname, "../../frontend/public/data");

async function syncStaticSnapshots() {
  await connectDB();

  const homepageGames = await Game.find({ isActive: true, showOnHomepage: true })
    .sort({ homepagePosition: 1, title: 1 })
    .select(
      "title poster description genre releaseDate averageRating totalRatings homepagePosition"
    )
    .lean();

  const trendingGames = await Game.find({ isActive: true, trending: true })
    .sort({ trendingPosition: 1, trendingScore: -1, title: 1 })
    .select(
      "title poster description genre releaseDate averageRating totalRatings trendingPosition trendingScore"
    )
    .lean();

  const homepagePayload = {
    games: homepageGames.map((g) => ({
      _id: g._id,
      title: g.title,
      description: g.description,
      genre: g.genre,
      releaseDate: g.releaseDate,
      poster: g.poster,
      averageRating: g.averageRating,
      totalRatings: g.totalRatings,
    })),
    updatedAt: new Date().toISOString(),
  };

  const trendingPayload = {
    games: trendingGames.map((g) => ({
      _id: g._id,
      title: g.title,
      description: g.description,
      genre: g.genre,
      releaseDate: g.releaseDate,
      poster: g.poster,
      averageRating: g.averageRating,
      totalRatings: g.totalRatings,
      trendingPosition: g.trendingPosition,
      trendingScore: g.trendingScore,
    })),
    updatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(frontendDataDir, { recursive: true });
  fs.writeFileSync(
    path.join(frontendDataDir, "homepage.json"),
    JSON.stringify(homepagePayload)
  );
  fs.writeFileSync(
    path.join(frontendDataDir, "trending.json"),
    JSON.stringify(trendingPayload)
  );

  const checkTitles = ["Minecraft", "Fortnite", "League of Legends"];
  for (const title of checkTitles) {
    const inHome = homepageGames.find((g) => g.title === title);
    const inTrend = trendingGames.find((g) => g.title === title);
    console.log(
      `${title}: homepage=${inHome ? inHome.poster : "n/a"}, trending=${inTrend ? inTrend.poster : "n/a"}`
    );
  }

  console.log(
    `\nSynced ${homepageGames.length} homepage + ${trendingGames.length} trending games to frontend/public/data`
  );

  await mongoose.disconnect();
}

syncStaticSnapshots().catch((err) => {
  console.error(err);
  process.exit(1);
});