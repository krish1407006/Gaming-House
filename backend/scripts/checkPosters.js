import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function check() {
  await connectDB();

  const games = await Game.find({}).select("title poster").limit(5).lean();
  games.forEach(g => console.log(g.title, "->", g.poster ? "HAS POSTER" : "NO POSTER"));

  console.log("Total games:", await Game.countDocuments({}));
  const noPoster = await Game.countDocuments({ poster: { $exists: false } });
  console.log("Games without poster field:", noPoster);
  const nullPoster = await Game.countDocuments({ poster: null });
  console.log("Games with null poster:", nullPoster);

  // Check what posters look like
  const someWithPoster = await Game.find({ poster: { $exists: true, $ne: null } }).select("title poster").limit(3).lean();
  console.log("\nSample poster URLs:");
  someWithPoster.forEach(g => console.log(g.title, ":", g.poster?.substring(0, 80)));

  process.exit(0);
}
check();
