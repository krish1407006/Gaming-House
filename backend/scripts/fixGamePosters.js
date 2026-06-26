import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const updates = {
  "Grand Theft Auto VI": {
    poster: "https://upload.wikimedia.org/wikipedia/en/4/46/Grand_Theft_Auto_VI.png",
    screenshots: [
      "https://rockstarintel.com/wp-content/uploads/2025/05/Vice_City_01.jpg",
      "https://rockstarintel.com/wp-content/uploads/2025/05/Lucia_Caminos_03.jpg",
      "https://rockstarintel.com/wp-content/uploads/2025/05/Jason_Duval_01.jpg",
      "https://rockstarintel.com/wp-content/uploads/2025/05/Grassrivers_01.jpg",
      "https://rockstarintel.com/wp-content/uploads/2025/05/Mount_Kalaga_National_Park_01.jpg",
      "https://rockstarintel.com/wp-content/uploads/2025/05/Ambrosia_01.jpg",
    ],
  },
  "Doom: The Dark Ages": {
    poster: "https://upload.wikimedia.org/wikipedia/en/7/7f/DOOM%2C_The_Dark_Ages_Game_Cover.jpeg",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/7/7f/DOOM%2C_The_Dark_Ages_Game_Cover.jpeg",
      "https://upload.wikimedia.org/wikipedia/en/f/fd/Doom_The_Dark_Ages_gameplay.jpg",
    ],
  },
  "Borderlands 4": {
    poster: "https://upload.wikimedia.org/wikipedia/en/f/fd/Borderlands_4_cover_art.jpg",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/f/fd/Borderlands_4_cover_art.jpg",
    ],
  },
  "Elden Ring Nightreign": {
    poster: "https://upload.wikimedia.org/wikipedia/en/f/f0/Elden_Ring_Nightreign_cover_art.png",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/f/f0/Elden_Ring_Nightreign_cover_art.png",
    ],
  },
  "Mafia: The Old Country": {
    poster: "https://upload.wikimedia.org/wikipedia/en/a/af/Mafia_The_Old_Country_cover_art.jpg",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/a/af/Mafia_The_Old_Country_cover_art.jpg",
    ],
  },
  "Like a Dragon: Pirate Yakuza in Hawaii": {
    poster: "https://upload.wikimedia.org/wikipedia/en/8/81/Like_a_Dragon_Pirate_Yakuza_in_Hawaii_Cover_Art.jpg",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/8/81/Like_a_Dragon_Pirate_Yakuza_in_Hawaii_Cover_Art.jpg",
    ],
  },
  "Clair Obscur: Expedition 33": {
    poster: "https://upload.wikimedia.org/wikipedia/en/5/5a/Clair_Obscur%2C_Expedition_33_Cover_1.webp",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/5/5a/Clair_Obscur%2C_Expedition_33_Cover_1.webp",
      "https://upload.wikimedia.org/wikipedia/en/6/6a/Clair_Obscur_gameplay_screenshot.png",
    ],
  },
  "South of Midnight": {
    poster: "https://upload.wikimedia.org/wikipedia/en/8/83/South_of_Midnight_cover_art.jpeg",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/8/83/South_of_Midnight_cover_art.jpeg",
      "https://upload.wikimedia.org/wikipedia/en/e/ed/South_of_Midnight_gameplay_screenshot.jpg",
    ],
  },
  "Death Stranding 2: On the Beach": {
    poster: "https://upload.wikimedia.org/wikipedia/en/e/e0/Death_Stranding_2_Icon.jpg",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/e/e0/Death_Stranding_2_Icon.jpg"],
  },
  Avowed: {
    poster: "https://upload.wikimedia.org/wikipedia/en/4/4d/Avowed_key_art.jpeg",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/4/4d/Avowed_key_art.jpeg"],
  },
  "Metroid Prime 4: Beyond": {
    poster: "https://upload.wikimedia.org/wikipedia/en/4/48/Metroid_Prime_4_Beyond_cover_art.png",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/4/48/Metroid_Prime_4_Beyond_cover_art.png"],
  },
  Atomfall: {
    poster: "https://upload.wikimedia.org/wikipedia/en/1/13/Atomfall_cover_art.jpeg",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/1/13/Atomfall_cover_art.jpeg"],
  },
  "Gears of War: E-Day": {
    poster: "https://upload.wikimedia.org/wikipedia/en/9/9e/Gears_of_War_E-Day_cover_art.png",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/9/9e/Gears_of_War_E-Day_cover_art.png"],
  },
  "Ghost of Yotei": {
    poster: "https://upload.wikimedia.org/wikipedia/en/7/7a/Ghost_of_Yotei_gameplay_screenshot.jpg",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/7/7a/Ghost_of_Yotei_gameplay_screenshot.jpg"],
  },
  "Marvel's Wolverine": {
    poster: "https://upload.wikimedia.org/wikipedia/en/3/3d/Marvel%27s_Wolverine_cover_art.jpg",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/3/3d/Marvel%27s_Wolverine_cover_art.jpg"],
  },
  "The First Berserker: Khazan": {
    poster: "https://upload.wikimedia.org/wikipedia/en/6/64/The_First_Berserker_Khazan_cover.jpg",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/6/64/The_First_Berserker_Khazan_cover.jpg"],
  },
  "Fable": {
    poster: "https://upload.wikimedia.org/wikipedia/en/b/b8/Fable_key_art.png",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/b/b8/Fable_key_art.png"],
  },
  "The Witcher IV": {
    poster: "https://upload.wikimedia.org/wikipedia/en/4/4c/The_Witcher_IV_logo.png",
    screenshots: ["https://upload.wikimedia.org/wikipedia/en/4/4c/The_Witcher_IV_logo.png"],
  },
};

async function main() {
  await connectDB();
  let count = 0;
  for (const [title, data] of Object.entries(updates)) {
    const game = await Game.findOne({ title });
    if (!game) { console.log(`NOT FOUND: ${title}`); continue; }
    await Game.findByIdAndUpdate(game._id, {
      $set: { poster: data.poster, screenshots: data.screenshots },
    });
    console.log(`✅ ${title}: poster='${data.poster.substring(0, 50)}...', ${data.screenshots.length} screenshots`);
    count++;
  }
  console.log(`\nUpdated ${count} games`);
  process.exit(0);
}

main();
