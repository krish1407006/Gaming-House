import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const TARGET_COUNT = 6;
const STEAM_DELAY_MS = 350;

const RELATED_STEAM_FALLBACK = {
  "Ghost of Yotei": "2215430",
  "Grand Theft Auto VI": "271590",
  "Mass Effect 5": "1328670",

  "The Witcher IV": "292030",
  "Gran Turismo 7": "2440510",
  "League of Legends": "570",
  "World of Warcraft": "39210",
};

const MANUAL_SCREENSHOTS = {
  "The Legend of Zelda: Breath of the Wild": [
    "https://www.zeldadungeon.net/wiki/images/8/8a/TLOZBreathoftheWild_Presentation2017_scrn00.jpg",
    "https://www.zeldadungeon.net/wiki/images/0/0d/BotW_E3_2016_scrn04.jpg",
    "https://www.zeldadungeon.net/wiki/images/9/9f/May2017_Hardmode_1.jpg",
    "https://www.zeldadungeon.net/wiki/images/1/1e/BotW_E3_2016_scrn01.jpg",
    "https://www.zeldadungeon.net/wiki/images/3/3a/BotW_E3_2016_scrn02.jpg",
    "https://www.zeldadungeon.net/wiki/images/5/5c/BotW_E3_2016_scrn03.jpg",
  ],
  Bloodborne: [
    "https://upload.wikimedia.org/wikipedia/en/3/36/Bloodborne_Alpha_PlayStation_4_gameplay_screenshot.png",
    "https://images7.alphacoders.com/130/thumb-1920-1305260.jpeg",
    "https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg",
    "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bloodborne_Cover_Wallpaper.jpg/1920px-Bloodborne_Cover_Wallpaper.jpg",
    "https://upload.wikimedia.org/wikipedia/en/3/36/Bloodborne_Alpha_PlayStation_4_gameplay_screenshot.png",
    "https://images7.alphacoders.com/130/thumb-1920-1305260.jpeg",
  ],
  "Metroid Prime 4: Beyond": [
    "https://i0.wp.com/shinesparkers.net/wp-content/uploads/2025/03/Switch_MetroidPrime4Beyond_SCRN_Scene_02.png?ssl=1",
    "https://i0.wp.com/shinesparkers.net/wp-content/uploads/2025/03/Switch_MetroidPrime4Beyond_SCRN_Scene_03.png?ssl=1",
    "https://i0.wp.com/shinesparkers.net/wp-content/uploads/2025/03/switch_metroidprime4beyond_scrn_scene_01_optimized.png?ssl=1",
    "https://i0.wp.com/shinesparkers.net/wp-content/uploads/2025/03/switch_metroidprime4beyond_scrn_battle_01_optimized.png?ssl=1",
    "https://i0.wp.com/shinesparkers.net/wp-content/uploads/2025/03/switch_metroidprime4beyond_scrn_explore_01_optimized.png?ssl=1",
    "https://i0.wp.com/shinesparkers.net/wp-content/uploads/2025/03/switch_metroidprime4beyond_scrn_planetviewros_01_optimized.png?ssl=1",
  ],
  Minecraft: [
    "https://cdn.akamai.steamstatic.com/steam/apps/1672970/library_hero.jpg",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_46ee31494b5d144d5ef6670cb5a1564abbc26fab.1920x1080.jpg?t=1717003107",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_73b488e696e3ae45f5d0a5750de524c231dab8a2.1920x1080.jpg?t=1717003107",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_9cb3efba6636610ec78eddd550147ed5ee7be3a0.1920x1080.jpg?t=1717003107",
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_52883e4263c8f8bca14236118ab62c0f70f2c8d0.1920x1080.jpg?t=1717003107",
    "https://cdn.akamai.steamstatic.com/steam/apps/1672970/header.jpg",
  ],
  Fortnite: [
    "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg",
    "https://fortnite-api.com/images/map_en.png",
    "https://fortnite-api.com/images/map.png",
    "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg",
    "https://fortnite-api.com/images/map_en.png",
    "https://fortnite-api.com/images/map.png",
  ],
  "League of Legends": [
    "https://upload.wikimedia.org/wikipedia/en/c/ca/League_of_Legends_Screenshot_2018.png",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ezreal_0.jpg",
  ],
  "Marvel's Wolverine": [
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/2215/a69481c5fa50fe19f42896d84fb7cbf37ab8646801a93322.png",
    "https://image.api.playstation.com/vulcan/ap/rnd/202510/0721/e54995d925972b21f0092d0f27a4884f2c883c439514dede.png",
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/2e98d11ecc5fc86cf404d0f4b7b4a1ba5774a51bf3db0020.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/5ba04b023e0b4c4aa7fbdbf2170262a52bc0384ee44efce0.jpg",
    "https://sm.ign.com/t/ign_za/photo/default/4fff4e3964b95d390d4ed47a03083ea07096a58e-scaled-174541133221_feeu.1400.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/bc854cdd9ee7b344fd1ad343a9eff5911ae8c08cb0d284cb.jpg",
  ],
  Valorant: [
    "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
    "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
    "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
    "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
    "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
    "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/premierbackgroundimage.png",
  ],
};

function extractSteamAppId(game) {
  if (game.steamAppId) return String(game.steamAppId);

  const sources = [game.poster, game.backdrop, ...(game.screenshots || [])];
  for (const url of sources) {
    const match = String(url || "").match(
      /(?:store_item_assets\/)?steam\/apps\/(\d+)/
    );
    if (match) return match[1];
  }

  return null;
}

function resolveSteamAppId(game) {
  return (
    extractSteamAppId(game) ||
    RELATED_STEAM_FALLBACK[game.title] ||
    null
  );
}

function toHdLandscape(url) {
  if (!url) return null;
  return url
    .replace(/\.600x338\.jpg/i, ".1920x1080.jpg")
    .replace(/\.116x65\.jpg/i, ".1920x1080.jpg");
}

function pickScreenshots(urls) {
  const seen = new Set();
  const picked = [];

  for (const raw of urls) {
    const url = toHdLandscape(raw);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    picked.push(url);
    if (picked.length >= TARGET_COUNT) break;
  }

  return picked;
}

async function fetchSteamScreenshots(appId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=en`,
      { signal: controller.signal }
    );
    if (!res.ok) return [];

    const json = await res.json();
    const data = json?.[appId]?.data;
    if (!data) return [];

    const screenshots = (data.screenshots || [])
      .map((shot) => shot.path_full)
      .filter(Boolean);

    return { screenshots };
  } catch {
    return { screenshots: [], backdrop: null };
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchGameplayScreenshots() {
  await connectDB();

  const games = await Game.find({ isActive: true }).sort("title");
  let updated = 0;
  let steamCount = 0;
  let manualCount = 0;
  let skipped = 0;

  for (const game of games) {
    let screenshots = [];
    let steamAppId = game.steamAppId;

    if (MANUAL_SCREENSHOTS[game.title]) {
      screenshots = pickScreenshots(MANUAL_SCREENSHOTS[game.title]);
      manualCount += 1;
    } else {
      const appId = resolveSteamAppId(game);
      if (appId) {
        const steamData = await fetchSteamScreenshots(appId);
        screenshots = pickScreenshots(steamData.screenshots || []);
        if (!steamAppId && extractSteamAppId(game)) {
          steamAppId = Number(appId);
        }
        steamCount += 1;
        await sleep(STEAM_DELAY_MS);
      }
    }

    if (screenshots.length < TARGET_COUNT && game.poster) {
      screenshots = pickScreenshots([
        ...screenshots,
        game.poster,
        game.backdrop,
        ...(game.screenshots || []),
      ]);
    }

    if (screenshots.length === 0) {
      console.warn(`Skipped (no images): ${game.title}`);
      skipped += 1;
      continue;
    }

    const update = {
      screenshots: screenshots.slice(0, TARGET_COUNT),
    };

    if (game.poster) update.backdrop = game.poster;
    if (steamAppId && !game.steamAppId) update.steamAppId = steamAppId;

    await Game.updateOne({ _id: game._id }, { $set: update });
    updated += 1;
    console.log(
      `Updated ${game.title} — ${update.screenshots.length} HD screenshots`
    );
  }

  console.log(
    `\nDone — updated ${updated}/${games.length} (steam/related: ${steamCount}, manual: ${manualCount}, skipped: ${skipped})`
  );
  await mongoose.disconnect();
}

fetchGameplayScreenshots().catch((error) => {
  console.error("Failed to fetch gameplay screenshots:", error);
  process.exit(1);
});