import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const promotions = [
  { title: "Grand Theft Auto VI",  rating: 9.9, votes: 9999, trending: true, featured: true, rank: 1 },
  { title: "Grand Theft Auto V",   rating: 9.5, votes: 8500, trending: true, featured: true, rank: 2 },
  { title: "Red Dead Redemption 2", rating: 9.5, votes: 8200, trending: true, featured: true, rank: 3 },
  { title: "Ghost of Tsushima",    rating: 9.3, votes: 7800, trending: true, featured: true, rank: 4 },
  { title: "Ghost of Yotei",       rating: 9.2, votes: 7500, trending: true, featured: true, rank: 5 },
  { title: "Resident Evil 4 Remake",    rating: 9.2, votes: 7200, trending: true, featured: true, rank: 6 },
  { title: "Resident Evil 2 Remake",    rating: 9.1, votes: 7000, trending: true, featured: true, rank: 7 },
  { title: "Resident Evil 7: Biohazard", rating: 9.0, votes: 6800, trending: true, featured: true, rank: 8 },
  { title: "Resident Evil Village",     rating: 9.0, votes: 6600, trending: true, featured: true, rank: 9 },
  { title: "Resident Evil 3 Remake",    rating: 8.5, votes: 6000, trending: true, featured: true, rank: 10 },
  { title: "Resident Evil 5",           rating: 8.0, votes: 5500, trending: true, featured: true, rank: 11 },
  { title: "Resident Evil 0",           rating: 7.5, votes: 5000, trending: true, featured: true, rank: 12 },
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
          averageRating: p.rating,
          totalRatings: p.votes,
          trending: p.trending,
          featured: p.featured,
          createdAt,
        },
      },
      { timestamps: false } // prevent Mongoose from overriding createdAt
    );

    console.log(`✅ ${p.title}: rating=${p.rating}, votes=${p.votes}, trending=${p.trending}, featured=${p.featured}`);
  }

  console.log("\nDone. These games will now appear at the top of Home, Trending, and Top Rated pages.");
  process.exit(0);
}

main();
