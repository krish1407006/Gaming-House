import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function listAllGameTitles() {
  await connectDB();
  const games = await Game.find({}).sort("title").select("title _id isActive poster").lean();

  const titles = {};
  for (const g of games) {
    const key = g.title.trim().toLowerCase();
    if (!titles[key]) titles[key] = [];
    titles[key].push(g);
  }

  const dupes = Object.entries(titles).filter(([, arr]) => arr.length > 1);
  console.log(`Total games: ${games.length}, duplicate titles: ${dupes.length}`);
  dupes.forEach(([t, arr]) => {
    console.log(`\n"${t}":`);
    arr.forEach((g) => console.log(`  ${g._id} active=${g.isActive}`));
  });

  const active = games.filter((g) => g.isActive);
  const spider = active.filter((g) => /spider|wolverine/i.test(g.title));
  console.log("\nActive Spider/Wolverine:");
  spider.forEach((g) => console.log(`- ${g.title} | ${g.poster?.slice(0, 60)}`));

  await mongoose.disconnect();
}

listAllGameTitles();