import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const TITLES = process.argv.slice(2);

async function dumpGameMedia() {
  await connectDB();
  const games = await Game.find({
    isActive: true,
    ...(TITLES.length ? { title: { $in: TITLES } } : {}),
  })
    .sort("title")
    .lean();

  for (const g of games) {
    console.log(`\n=== ${g.title} ===`);
    console.log(`poster: ${g.poster}`);
    console.log(`backdrop: ${g.backdrop}`);
    console.log(`steamAppId: ${g.steamAppId || "none"}`);
    console.log("screenshots:");
    (g.screenshots || []).forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  }

  await mongoose.disconnect();
}

dumpGameMedia().catch((err) => {
  console.error(err);
  process.exit(1);
});