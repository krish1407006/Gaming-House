import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const WOLVERINE_POSTER =
  "https://image.api.playstation.com/vulcan/ap/rnd/202605/2215/a69481c5fa50fe19f42896d84fb7cbf37ab8646801a93322.png";

const WOLVERINE_SCREENSHOTS = [
  "https://image.api.playstation.com/vulcan/ap/rnd/202605/2215/a69481c5fa50fe19f42896d84fb7cbf37ab8646801a93322.png",
  "https://image.api.playstation.com/vulcan/ap/rnd/202510/0721/e54995d925972b21f0092d0f27a4884f2c883c439514dede.png",
  "https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/2e98d11ecc5fc86cf404d0f4b7b4a1ba5774a51bf3db0020.jpg",
  "https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/5ba04b023e0b4c4aa7fbdbf2170262a52bc0384ee44efce0.jpg",
  "https://sm.ign.com/t/ign_za/photo/default/4fff4e3964b95d390d4ed47a03083ea07096a58e-scaled-174541133221_feeu.1400.jpg",
  "https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/bc854cdd9ee7b344fd1ad343a9eff5911ae8c08cb0d284cb.jpg",
];

async function fixWolverinePoster() {
  await connectDB();

  const result = await Game.updateOne(
    { title: "Marvel's Wolverine", isActive: true },
    {
      $set: {
        poster: WOLVERINE_POSTER,
        backdrop: WOLVERINE_POSTER,
        screenshots: WOLVERINE_SCREENSHOTS,
      },
      $unset: { steamAppId: "" },
    }
  );

  if (result.matchedCount === 0) {
    console.log("Marvel's Wolverine not found");
  } else {
    console.log("Fixed Marvel's Wolverine poster and screenshots");
    console.log(`  poster: ${WOLVERINE_POSTER}`);
  }

  const spider = await Game.findOne({ title: "Spider-Man 2", isActive: true }).lean();
  if (spider) {
    console.log(`\nSpider-Man 2 unchanged: ${spider.poster}`);
  }

  await mongoose.disconnect();
}

fixWolverinePoster();