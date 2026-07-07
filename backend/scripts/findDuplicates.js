import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function findDuplicates() {
  await connectDB();

  const games = await Game.find({ isActive: true }).select("title _id showOnHomepage trending homepagePosition trendingPosition").lean();

  const spider = games.filter((g) => /spider/i.test(g.title));
  console.log("Spider-Man games:\n", JSON.stringify(spider, null, 2));

  const byTitle = {};
  for (const g of games) {
    const key = g.title.trim().toLowerCase();
    if (!byTitle[key]) byTitle[key] = [];
    byTitle[key].push(g);
  }

  const dupes = Object.entries(byTitle).filter(([, list]) => list.length > 1);
  console.log(`\nExact title duplicates: ${dupes.length}`);
  dupes.forEach(([title, list]) => {
    console.log(`\n${title}:`);
    list.forEach((g) => console.log(`  ${g._id} homepage=${g.showOnHomepage} trending=${g.trending}`));
  });

  await mongoose.disconnect();
}

findDuplicates();