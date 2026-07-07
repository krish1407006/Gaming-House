import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function checkMissingMedia() {
  await connectDB();
  const games = await Game.find({ isActive: true }).sort("title").lean();

  const missing = [];

  for (const g of games) {
    const noPoster = !g.poster || g.poster.trim() === "";
    const noBackdrop = !g.backdrop || g.backdrop.trim() === "";
    const noScreenshots = !g.screenshots || g.screenshots.length === 0;
    const badPoster =
      g.poster &&
      (g.poster.includes("NONE") ||
        g.poster.endsWith(".svg") ||
        g.poster.includes("placeholder"));

    if (noPoster || noBackdrop || noScreenshots || badPoster) {
      missing.push({
        title: g.title,
        poster: g.poster || "NONE",
        backdrop: g.backdrop || "NONE",
        screenshots: g.screenshots?.length || 0,
        steamAppId: g.steamAppId || null,
      });
    }
  }

  console.log(`Games with missing/bad media: ${missing.length}\n`);
  missing.forEach((g) => {
    console.log(`${g.title}`);
    console.log(`  poster: ${g.poster.substring(0, 120)}`);
    console.log(`  backdrop: ${g.backdrop.substring(0, 80)}`);
    console.log(`  screenshots: ${g.screenshots}`);
    console.log(`  steamAppId: ${g.steamAppId}`);
    console.log("");
  });

  await mongoose.disconnect();
}

checkMissingMedia().catch((err) => {
  console.error(err);
  process.exit(1);
});