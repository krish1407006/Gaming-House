import "dotenv/config";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function v() {
  await connectDB();
  const titles = ["League of Legends", "World of Warcraft", "Valorant", "Fortnite", "Gran Turismo 7"];
  for (const t of titles) {
    const g = await Game.findOne({ title: t }).select("title screenshots").lean();
    console.log(t + ": " + (g?.screenshots?.length || 0) + " screenshots");
    (g?.screenshots || []).forEach((u, i) => console.log(`  [${i}]: ${u}`));
  }
  process.exit(0);
}
v();
