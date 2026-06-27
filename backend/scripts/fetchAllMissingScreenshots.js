import "dotenv/config";
import mongoose from "mongoose";
import axios from "axios";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const UA = "Mozilla/5.0";
const DELAY = 1200;

// All games without screenshots mapped to Steam App ID (or null)
const targets = {
  "Elden Ring": 1245620,
  "Cyberpunk 2077": 1091500,
  "God of War Ragnarök": 2322010,
  "Baldur's Gate 3": 1086940,
  "Hogwarts Legacy": 990080,
  "The Witcher 3: Wild Hunt": 292030,
  "Red Dead Redemption 2": 1174180,
  "Ghost of Tsushima": 2215430,
  "Final Fantasy XVI": 2515020,
  "Starfield": 1716740,
  "Palworld": 1623730,
  "Dragon's Dogma 2": 2054970,
  "Helldivers 2": 553850,
  "Tekken 8": 1778820,
  "Final Fantasy VII Remake": 1462040,
  "Dark Souls III": 374320,
  "Monster Hunter: World": 582160,
  "Metal Gear Solid V: The Phantom Pain": 287700,
  "Death Stranding": 1850570,
  "Persona 5": 1687950,
  "Devil May Cry 5": 601150,
  "Resident Evil 4 Remake": 2050650,
  "Street Fighter 6": 1364780,
  "Mortal Kombat 1": 1971870,
  "Alan Wake 2": 2477940,
  "Star Wars Jedi: Survivor": 1774580,
  "Call of Duty: Modern Warfare III": 2519960,
  "Grand Theft Auto V": 271590,
  "Dota 2": 570,
  "Counter-Strike 2": 730,
  "Overwatch 2": 2357570,
  "Apex Legends": 1172470,
  "Warframe": 230410,
  "Path of Exile": 238960,
  "Lost Ark": 1599340,
  "New World": 1063730,
  "Final Fantasy XIV": 39210,
  "Halo Infinite": 1240440,
  "Assassin's Creed: Mirage": 2840340,
  "Spider-Man 2": 2651280,
  "NBA 2K24": 2338770,
  "FC 24": 2195250,
  "Forza Motorsport": 2440510,
  "Bloodborne": 2688700,

  // Non-Steam games (no Steam API available)
  "The Legend of Zelda: Breath of the Wild": null,
  "League of Legends": null,
  "Valorant": null,
  "Minecraft": null,
  "Fortnite": null,
  "World of Warcraft": null,
  "Gran Turismo 7": null,
};



async function fetchSteamScreenshots(appId) {
  try {
    const { data } = await axios.get(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=en&cc=US`,
      { timeout: 15000, headers: { "User-Agent": UA } }
    );
    if (data[appId]?.success && data[appId]?.data?.screenshots) {
      return data[appId].data.screenshots.slice(0, 6).map((s) =>
        s.path_full.startsWith("https://")
          ? s.path_full
          : `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/${s.path_full}`
      );
    }
    return [];
  } catch (e) {
    console.log(`    Steam API error: ${e.message}`);
    return [];
  }
}

async function main() {
  await connectDB();
  let steamOk = 0, steamFail = 0;

  for (const [title, appId] of Object.entries(targets)) {
    const game = await Game.findOne({ title });
    if (!game) { console.log(`❌ NOT FOUND: ${title}`); continue; }

    const existingCount = game.screenshots?.length || 0;
    if (existingCount >= 3) {
      console.log(`⏭️ ${title}: already has ${existingCount} screenshots, skipping`);
      continue;
    }

    if (appId) {
      console.log(`Fetching Steam: ${title} (app ${appId})...`);
      const urls = await fetchSteamScreenshots(appId);
      if (urls.length >= 3) {
        await Game.findByIdAndUpdate(game._id, { $set: { screenshots: urls } });
        console.log(`  ✅ ${urls.length} screenshots`);
        steamOk++;
      } else if (urls.length > 0) {
        await Game.findByIdAndUpdate(game._id, { $set: { screenshots: urls } });
        console.log(`  ⚠️ Only ${urls.length} screenshots`);
        steamOk++;
      } else {
        console.log(`  ❌ No screenshots from Steam`);
        steamFail++;
      }
      await new Promise((r) => setTimeout(r, DELAY));
    } else {
      console.log(`⏭️ ${title}: non-Steam, skipping (no reliable source)`);
    }
  }

  console.log(`\nDone! Steam OK: ${steamOk}, Steam fail: ${steamFail}`);
  process.exit(0);
}

main();
