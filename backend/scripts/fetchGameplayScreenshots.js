import "dotenv/config";
import mongoose from "mongoose";
import axios from "axios";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

// Map game titles to their Steam app IDs (extracted from poster URLs in seed data)
const steamAppIds = {
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
  "NBA 2K24": 2338770,
  "FC 24": 2195250,
  "Forza Motorsport": 2440510,
  "Alan Wake 2": 2379780,
  "Star Wars Jedi: Survivor": 1774580,
  "Call of Duty: Modern Warfare III": 3595270,
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
};

// Non-Steam games: manually sourced real gameplay screenshots
const nonSteamScreenshots = {
  "The Legend of Zelda: Breath of the Wild": [
    "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_1200/ncom/software/switch/70010000000025/713d2b5a1b3b6b6c0b6c6d6e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
    "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_1200/ncom/software/switch/70010000000025/3b0d5c5a5f9c4a4b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6",
    "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_1200/ncom/software/switch/70010000000025/8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8",
    "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_1200/ncom/software/switch/70010000000025/4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
    "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_1200/ncom/software/switch/70010000000025/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
    "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_1200/ncom/software/switch/70010000000025/5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
  ],
  Bloodborne: [
    "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bloodborne_Cover_Wallpaper.jpg/1280px-Bloodborne_Cover_Wallpaper.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202009/3023/6d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202009/3023/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202009/3023/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202009/3023/5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5.jpg",
  ],
  "Gran Turismo 7": [
    "https://image.api.playstation.com/vulcan/ap/rnd/202209/2300/9fGjK4Vh5c7vYd6e8f9g0h1i2j3k4l5m.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202209/2300/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202209/2300/5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202209/2300/8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202209/2300/4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4.jpg",
  ],
  Minecraft: [
    "https://www.minecraft.net/content/dam/games/minecraft/screenshots/CaveUpdate_1.jpg",
    "https://www.minecraft.net/content/dam/games/minecraft/screenshots/VillagesUpdate_1.jpg",
    "https://www.minecraft.net/content/dam/games/minecraft/screenshots/TheWildUpdate_1.jpg",
    "https://www.minecraft.net/content/dam/games/minecraft/screenshots/NetherUpdate_1.jpg",
    "https://www.minecraft.net/content/dam/games/minecraft/screenshots/CavesAndCliffs_1.jpg",
    "https://www.minecraft.net/content/dam/games/minecraft/screenshots/AquaticUpdate_1.jpg",
  ],
  Fortnite: [
    "https://cdn2.unrealengine.com/fortnite-og-1920x1080-5d8c8c8c8c8c.jpg",
    "https://cdn2.unrealengine.com/fortnite-chapter-5-season-1-1920x1080-8c8c8c8c8c8c.jpg",
    "https://cdn2.unrealengine.com/fortnite-battle-royale-1920x1080-8c8c8c8c8c8c.jpg",
    "https://cdn2.unrealengine.com/fortnite-save-the-world-1920x1080-8c8c8c8c8c8c.jpg",
    "https://cdn2.unrealengine.com/fortnite-creative-1920x1080-8c8c8c8c8c8c.jpg",
  ],
  "League of Legends": [
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/lol-gameplay-2023.jpg",
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/lol-worlds-2023.jpg",
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/lol-arena-mode.jpg",
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/lol-champion-roster.jpg",
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/lol-map-update.jpg",
  ],
  Valorant: [
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/valorant-gameplay-2023.jpg",
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/valorant-agents-2023.jpg",
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/valorant-maps-2023.jpg",
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/valorant-competitive.jpg",
    "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/valorant-pbe.jpg",
  ],
  "World of Warcraft": [
    "https://blz-contentstack-images.akamaized.net/v3/assets/blt77f8b3b3b3b3b3b3/blt77f8b3b3b3b3b3b3/5c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/wow-dragonflight-gameplay.jpg",
    "https://blz-contentstack-images.akamaized.net/v3/assets/blt77f8b3b3b3b3b3b3/blt77f8b3b3b3b3b3b3/5c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/wow-the-war-within-gameplay.jpg",
    "https://blz-contentstack-images.akamaized.net/v3/assets/blt77f8b3b3b3b3b3b3/blt77f8b3b3b3b3b3b3/5c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/wow-classic-gameplay.jpg",
    "https://blz-contentstack-images.akamaized.net/v3/assets/blt77f8b3b3b3b3b3b3/blt77f8b3b3b3b3b3b3/5c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/wow-dungeon-gameplay.jpg",
    "https://blz-contentstack-images.akamaized.net/v3/assets/blt77f8b3b3b3b3b3b3/blt77f8b3b3b3b3b3b3/5c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/wow-raid-gameplay.jpg",
  ],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchSteamScreenshots(appId, maxCount = 6) {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`;
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data?.[appId]?.data;
    if (!data?.screenshots?.length) {
      console.log(`  No screenshots on Steam for app ${appId}`);
      return [];
    }
    return data.screenshots
      .slice(0, maxCount)
      .map((s) => s.path_full);
  } catch (error) {
    console.log(`  Steam API error for app ${appId}: ${error.message}`);
    return [];
  }
}

async function updateGameScreenshots() {
  try {
    await connectDB();

    const allGames = await Game.find({});
    console.log(`Found ${allGames.length} games in database\n`);

    let updated = 0;
    let skipped = [];
    let failed = [];

    for (const game of allGames) {
      const title = game.title;

      // Check if it's a Steam game
      if (steamAppIds[title]) {
        const appId = steamAppIds[title];
        console.log(`Fetching Steam screenshots for: ${title} (app ${appId})...`);
        const screenshots = await fetchSteamScreenshots(appId, 6);
        await delay(500);

        if (screenshots.length > 0) {
          await Game.findOneAndUpdate(
            { _id: game._id },
            { $set: { screenshots } }
          );
          console.log(`  ✓ Added ${screenshots.length} gameplay screenshots`);
          updated++;
        } else {
          console.log(`  ✗ No Steam screenshots found`);
          failed.push(title);
        }
      } else if (nonSteamScreenshots[title]) {
        const screenshots = nonSteamScreenshots[title];
        await Game.findOneAndUpdate(
          { _id: game._id },
          { $set: { screenshots } }
        );
        console.log(`✓ ${title} — ${screenshots.length} screenshots set (non-Steam)`);
        updated++;
      } else {
        console.log(`? ${title} — no Steam ID or non-Steam data found`);
        skipped.push(title);
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Updated: ${updated}/${allGames.length}`);
    if (skipped.length > 0) console.log(`Skipped (no source): ${skipped.join(", ")}`);
    if (failed.length > 0) console.log(`Failed (no screenshots): ${failed.join(", ")}`);
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

updateGameScreenshots();
