import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function check() {
  await connectDB();
  const games = await Game.find({ isActive: true }).lean();
  for (const g of games) {
    const isSteam = g.poster && g.poster.includes("steamstatic");
    const isWiki = g.poster && g.poster.includes("wikimedia");
    const type = isSteam ? "STEAM" : isWiki ? "WIKI" : "OTHER";
    const isLandscape = g.poster && (g.poster.includes("hero") || g.poster.includes("header"));
    console.log(`${type}${isLandscape ? " LANDSCAPE" : " PORTRAIT"}: ${g.title}`);
    console.log(`   ${(g.poster||"NONE").substring(0,100)}`);
  }
  await mongoose.disconnect();
}
check();
