import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function check() {
  await connectDB();
  const games = await Game.find({ isActive: true }).lean();
  games.forEach((g, i) => console.log(`${i+1}. ${g.title} | poster: ${g.poster || "NONE"}`));
  await mongoose.disconnect();
}
check();
