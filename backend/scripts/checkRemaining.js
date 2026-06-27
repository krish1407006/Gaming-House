import "dotenv/config";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const titles = ["Alan Wake 2", "The Legend of Zelda: Breath of the Wild", "Minecraft", "League of Legends", "World of Warcraft", "Valorant", "Fortnite", "Gran Turismo 7"];
async function v() {
  await connectDB();
  for (const t of titles) {
    const g = await Game.findOne({ title: t }).select("title screenshots").lean();
    console.log(t + ": " + (g?.screenshots?.length || 0) + " screenshots");
    if (g?.screenshots?.length > 0) {
      g.screenshots.slice(0, 2).forEach((u, i) => console.log(`  [${i}]: ${u.substring(0, 80)}`));
    }
  }
  process.exit(0);
}
v();
