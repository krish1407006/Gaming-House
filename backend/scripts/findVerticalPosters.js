import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

// Known Steam app IDs for games in the DB that have Wikipedia/portrait posters
const steamFallbacks = {
  "Grand Theft Auto VI": null, // not on Steam
  "Doom: The Dark Ages": { steamId: 3017860 },
  "Borderlands 4": { steamId: 1285190 },
  "Elden Ring Nightreign": { steamId: 2622380 },
  "Mafia: The Old Country": { steamId: 1941540 },
  "Like a Dragon: Pirate Yakuza in Hawaii": { steamId: 3061810 },
  "Clair Obscur: Expedition 33": { steamId: 1903340 },
  "South of Midnight": { steamId: 1934570 },
  "Death Stranding 2: On the Beach": { steamId: 3280350 },
  Avowed: { steamId: 2457220 },
  "Metroid Prime 4: Beyond": null,
  Atomfall: { steamId: 801800 },
  "Gears of War: E-Day": { steamId: 3010850 },
  "Ghost of Yotei": null,
  "Marvel's Wolverine": null,
  "The First Berserker: Khazan": { steamId: 2680010 },
  Fable: { steamId: 2769570 },
  "The Witcher IV": null,
  "Grand Theft Auto V": { steamId: 271590 },
  "Mass Effect 5": { steamId: 1328670 },
  "Alan Wake 2": null,
};

async function main() {
  await connectDB();

  const games = await Game.find({}).select("title poster image").lean();

  let updated = 0;

  for (const g of games) {
    const url = g.poster || g.image || "";
    // Check if URL is likely portrait (Wikipedia, upload.wikimedia, etc.)
    const isPortrait = /wikipedia|upload\.wikimedia/i.test(url);

    if (!isPortrait) continue;

    // Try to find a Steam landscape alternative
    const match = steamFallbacks[g.title];
    if (match && match.steamId) {
      const newPoster = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${match.steamId}/header.jpg`;
      await Game.findByIdAndUpdate(g._id, { $set: { poster: newPoster } });
      console.log(`✓ ${g.title} -> Steam header (${match.steamId})`);
      updated++;
    } else {
      // For games without Steam IDs, use a landscape placeholder approach:
      // Many of these game posters can use Steam capsule_616x353 images from the closest matching Steam game
      // Let's check common patterns
      console.log(`  PORTRAIT: ${g.title} - ${url.substring(0, 60)}`);
    }
  }

  console.log(`\nUpdated ${updated} games with landscape posters`);
  process.exit(0);
}

main();
