import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const promotions = [
  { title: "Grand Theft Auto VI",  trending: true, featured: true, rank: 1 },
  { title: "Grand Theft Auto V",   trending: true, featured: true, rank: 2 },
  { title: "Red Dead Redemption 2", trending: true, featured: true, rank: 3 },
  { title: "Ghost of Tsushima",    trending: true, featured: true, rank: 4 },
  { title: "Ghost of Yotei",       trending: true, featured: true, rank: 5 },
  { title: "Resident Evil 4 Remake",    trending: true, featured: true, rank: 6 },
  { title: "Resident Evil 2 Remake",    trending: true, featured: true, rank: 7 },
  { title: "Resident Evil 7: Biohazard", trending: true, featured: true, rank: 8 },
  { title: "Resident Evil Village",     trending: true, featured: true, rank: 9 },
  { title: "Resident Evil 3 Remake",    trending: true, featured: true, rank: 10 },
  { title: "Resident Evil 5",           trending: true, featured: true, rank: 11 },
  { title: "Resident Evil 0",           trending: true, featured: true, rank: 12 },
];

async function main() {
  await connectDB();

  const now = new Date();
  for (const p of promotions) {
    const game = await Game.findOne({ title: p.title });
    if (!game) {
      console.log(`NOT FOUND: ${p.title}`);
      continue;
    }

    // Set createdAt to a recent time (rank=1 is newest)
    const createdAt = new Date(now.getTime() + p.rank * 1000);

    await Game.findOneAndUpdate(
      { title: p.title },
      {
        $set: {
          trending: p.trending,
          featured: p.featured,
          createdAt,
        },
      },
      { timestamps: false } // prevent Mongoose from overriding createdAt
    );

    console.log(`✅ ${p.title}: trending=${p.trending}, featured=${p.featured}`);
  }

  console.log("\nDone. These games will now appear at the top of Home, Trending, and Top Rated pages.");
  process.exit(0);
}

main();
