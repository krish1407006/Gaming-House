import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const STEAM_DELAY_MS = 300;

const MANUAL_LANDSCAPE_POSTERS = {
  "The Legend of Zelda: Breath of the Wild":
    "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_2.0/c_scale,w_1920/ncom/en_US/games/switch/t/the-legend-of-zelda-breath-of-the-wild-switch/hero",
  Bloodborne:
    "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bloodborne_Cover_Wallpaper.jpg/1920px-Bloodborne_Cover_Wallpaper.jpg",
  "Gran Turismo 7":
    "https://image.api.playstation.com/vulcan/ap/rnd/202202/2806/y4liLwBLXmhWHIvakDIMG1T1.jpg",
  "League of Legends":
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/MissFortune_0.jpg",
  "Mass Effect 5":
    "https://cdn.akamai.steamstatic.com/steam/apps/1328670/header.jpg",
  "Metroid Prime 4: Beyond":
    "https://assets.nintendo.com/image/upload/f_auto/q_auto/c_scale,w_1920/Marketing/68272fb37fa56918996af8bfceddbc4223c2746af7c325b2067f0c62c65ef8c0/pmp_lksadf/introduction/keyart-large",
  "The Witcher IV":
    "https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg",
  "World of Warcraft":
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/header.jpg?t=1782870674",
  Fortnite:
    "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg",
  Valorant:
    "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/stylizedbackgroundimage.png",
  "Call of Duty: Modern Warfare III":
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/7d0f21912a075c33bbb5ea558100e187ceb234ac/header.jpg?t=1778886604",
  "Ghost of Yotei":
    "https://sm.ign.com/t/ign_za/photo/default/4fff4e3964b95d390d4ed47a03083ea07096a58e-scaled-174541133221_feeu.1400.jpg",
  "Grand Theft Auto VI":
    "https://rockstarintel.com/wp-content/uploads/2025/05/Vice_City_01.jpg",
  "Marvel's Wolverine":
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/2215/a69481c5fa50fe19f42896d84fb7cbf37ab8646801a93322.png",
  Minecraft:
    "https://cdn.akamai.steamstatic.com/steam/apps/1672970/library_hero.jpg",
};

const BAD_POSTER_PATTERNS = [
  /library_hero\.jpg/i,
  /t_screenshot_huge/i,
  /t_1080p/i,
  /thumb-/i,
  /wikimedia\.org/i,
  /wikipedia\.org/i,
  /boxart/i,
  /4kwallpapers\.com/i,
  /movie\.\d+x\d+/i,
  /movie_\d+x\d+/i,
  /capsule_231x87/i,
  /capsule_184x69/i,
];

function extractSteamAppId(game) {
  if (game.steamAppId) return String(game.steamAppId);

  const sources = [game.poster, game.backdrop, ...(game.screenshots || [])];
  for (const url of sources) {
    const match = String(url || "").match(/(?:store_item_assets\/)?steam\/apps\/(\d+)/);
    if (match) return match[1];
  }
  return null;
}

function isBadPoster(url) {
  if (!url) return true;
  if (BAD_POSTER_PATTERNS.some((pattern) => pattern.test(url))) return true;
  return !/header\.jpg/i.test(url);
}

function buildSteamHeaderUrl(appId, headerImage) {
  if (headerImage) return headerImage;
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

async function fetchSteamHeaderImage(appId) {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=en`
    );
    const json = await res.json();
    return json?.[appId]?.data?.header_image || null;
  } catch {
    return null;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fixGamePosters() {
  await connectDB();

  const games = await Game.find({ isActive: true }).sort("title");
  let updated = 0;
  let skipped = 0;

  for (const game of games) {
    let newPoster = null;
    const manual = MANUAL_LANDSCAPE_POSTERS[game.title];

    if (manual) {
      newPoster = manual;
    } else if (isBadPoster(game.poster)) {
      const appId = extractSteamAppId(game);
      if (appId) {
        const headerImage = await fetchSteamHeaderImage(appId);
        newPoster = buildSteamHeaderUrl(appId, headerImage);
        await sleep(STEAM_DELAY_MS);
      }
    } else if (game.poster?.includes("header.jpg")) {
      skipped += 1;
      continue;
    }

    if (!newPoster || newPoster === game.poster) {
      skipped += 1;
      continue;
    }

    const update = {
      poster: newPoster,
      backdrop: newPoster,
    };

    const appId = extractSteamAppId({ ...game, poster: newPoster });
    if (appId && !game.steamAppId) {
      update.steamAppId = Number(appId);
    }

    await Game.updateOne({ _id: game._id }, { $set: update });
    updated += 1;
    console.log(`Fixed: ${game.title}`);
    console.log(`  -> ${newPoster}`);
  }

  console.log(`\nDone — updated ${updated}, skipped ${skipped}, total ${games.length}`);
  await mongoose.disconnect();
}

fixGamePosters().catch((error) => {
  console.error("Failed to fix posters:", error);
  process.exit(1);
});