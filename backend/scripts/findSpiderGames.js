import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function findSpiderGames() {
  await connectDB();

  const all = await Game.find({
    $or: [
      { title: /spider/i },
      { title: /marvel.*man/i },
    ],
  })
    .select("title _id isActive showOnHomepage trending homepagePosition trendingPosition poster")
    .lean();

  console.log(`Found ${all.length} spider-related games:\n`);
  all.forEach((g) => {
    console.log(`- ${g.title}`);
    console.log(`  id: ${g._id}`);
    console.log(`  active: ${g.isActive}`);
    console.log(`  homepage: ${g.showOnHomepage} (${g.homepagePosition})`);
    console.log(`  trending: ${g.trending} (${g.trendingPosition})`);
    console.log(`  poster: ${(g.poster || "").slice(0, 80)}`);
    console.log("");
  });

  await mongoose.disconnect();
}

findSpiderGames();