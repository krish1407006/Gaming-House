import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const POSTER_UPDATES = {
  "Metroid Prime 4: Beyond":
    "https://assets.nintendo.com/image/upload/f_auto/q_auto/c_scale,w_1920/Marketing/68272fb37fa56918996af8bfceddbc4223c2746af7c325b2067f0c62c65ef8c0/pmp_lksadf/introduction/keyart-large",
  "The Legend of Zelda: Breath of the Wild":
    "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_2.0/c_scale,w_1920/ncom/en_US/games/switch/t/the-legend-of-zelda-breath-of-the-wild-switch/hero",
};

async function updateNintendoPosters() {
  await connectDB();

  for (const [title, poster] of Object.entries(POSTER_UPDATES)) {
    const result = await Game.updateOne(
      { title, isActive: true },
      { $set: { poster, backdrop: poster } }
    );

    if (result.matchedCount === 0) {
      console.log(`NOT FOUND: ${title}`);
    } else {
      console.log(`UPDATED: ${title}`);
      console.log(`  poster: ${poster}`);
    }
  }

  await mongoose.disconnect();
}

updateNintendoPosters().catch((err) => {
  console.error(err);
  process.exit(1);
});