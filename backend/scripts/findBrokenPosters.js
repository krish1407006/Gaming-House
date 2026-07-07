import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function findBrokenPosters() {
  await connectDB();
  const games = await Game.find({ isActive: true }).sort("title").lean();

  for (const g of games) {
    try {
      const res = await fetch(g.poster, { method: "HEAD", redirect: "follow" });
      const type = res.headers.get("content-type") || "";
      if (!res.ok || !type.startsWith("image")) {
        console.log(`BROKEN (${res.status}): ${g.title}`);
        console.log(`  ${g.poster}`);
      }
    } catch {
      console.log(`BROKEN (fetch error): ${g.title}`);
      console.log(`  ${g.poster}`);
    }
  }

  await mongoose.disconnect();
}

findBrokenPosters();