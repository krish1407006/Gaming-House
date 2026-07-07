import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const STEAM_DELAY_MS = 300;

async function fetchSteamHeaderImage(appId) {
  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=en`);
    const json = await res.json();
    return json?.[appId]?.data?.header_image || null;
  } catch { return null; }
}

function extractSteamAppId(game) {
  if (game.steamAppId) return String(game.steamAppId);
  const sources = [game.poster, game.backdrop, ...(game.screenshots || [])];
  for (const url of sources) {
    const match = String(url || "").match(/(?:store_item_assets\/)?steam\/apps\/(\d+)/);
    if (match) return match[1];
  }
  return null;
}

// ─── fixPosters ───────────────────────────────────────────
export async function fixPosters() {
  const BAD_PATTERNS = [/library_hero\.jpg/i, /t_screenshot_huge/i, /t_1080p/i, /thumb-/i, /wikimedia\.org/i, /wikipedia\.org/i, /boxart/i, /4kwallpapers\.com/i, /movie\.\d+x\d+/i, /movie_\d+x\d+/i, /capsule_231x87/i, /capsule_184x69/i];

  const MANUAL = {
    "The Legend of Zelda: Breath of the Wild": "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_2.0/c_scale,w_1920/ncom/en_US/games/switch/t/the-legend-of-zelda-breath-of-the-wild-switch/hero",
    Bloodborne: "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bloodborne_Cover_Wallpaper.jpg/1920px-Bloodborne_Cover_Wallpaper.jpg",
    "Gran Turismo 7": "https://image.api.playstation.com/vulcan/ap/rnd/202202/2806/y4liLwBLXmhWHIvakDIMG1T1.jpg",
    "League of Legends": "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/MissFortune_0.jpg",
    "Mass Effect 5": "https://cdn.akamai.steamstatic.com/steam/apps/1328670/header.jpg",
    "Metroid Prime 4: Beyond": "https://assets.nintendo.com/image/upload/f_auto/q_auto/c_scale,w_1920/Marketing/68272fb37fa56918996af8bfceddbc4223c2746af7c325b2067f0c62c65ef8c0/pmp_lksadf/introduction/keyart-large",
    "The Witcher IV": "https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg",
    "World of Warcraft": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/header.jpg?t=1782870674",
    Fortnite: "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg",
    Valorant: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/stylizedbackgroundimage.png",
    "Call of Duty: Modern Warfare III": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/7d0f21912a075c33bbb5ea558100e187ceb234ac/header.jpg?t=1778886604",
    "Ghost of Yotei": "https://sm.ign.com/t/ign_za/photo/default/4fff4e3964b95d390d4ed47a03083ea07096a58e-scaled-174541133221_feeu.1400.jpg",
    "Grand Theft Auto VI": "https://rockstarintel.com/wp-content/uploads/2025/05/Vice_City_01.jpg",
    "Marvel's Wolverine": "https://image.api.playstation.com/vulcan/ap/rnd/202605/2215/a69481c5fa50fe19f42896d84fb7cbf37ab8646801a93322.png",
    Minecraft: "https://cdn.akamai.steamstatic.com/steam/apps/1672970/library_hero.jpg",
  };

  function isBadPoster(url) {
    if (!url) return true;
    if (BAD_PATTERNS.some((p) => p.test(url))) return true;
    return !/header\.jpg/i.test(url);
  }

  await connectDB();
  const games = await Game.find({ isActive: true }).sort("title");
  let updated = 0, skipped = 0;

  for (const game of games) {
    let newPoster = null;
    const manual = MANUAL[game.title];

    if (manual) {
      newPoster = manual;
    } else if (isBadPoster(game.poster)) {
      const appId = extractSteamAppId(game);
      if (appId) {
        const headerImage = await fetchSteamHeaderImage(appId);
        newPoster = headerImage || `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
        await delay(STEAM_DELAY_MS);
      }
    } else if (game.poster?.includes("header.jpg")) { skipped++; continue; }

    if (!newPoster || newPoster === game.poster) { skipped++; continue; }

    const update = { poster: newPoster, backdrop: newPoster };
    const appId = extractSteamAppId({ ...game, poster: newPoster });
    if (appId && !game.steamAppId) update.steamAppId = Number(appId);

    await Game.updateOne({ _id: game._id }, { $set: update });
    updated++;
    console.log(`Fixed: ${game.title}`);
  }

  console.log(`\nDone — updated ${updated}, skipped ${skipped}, total ${games.length}`);
  await mongoose.disconnect();
}

// ─── fixBrokenMedia ───────────────────────────────────────
export async function fixBrokenMedia() {
  const GAME_MEDIA = {
    Minecraft: { poster: "https://cdn.akamai.steamstatic.com/steam/apps/1672970/library_hero.jpg", steamAppId: 1672970, screenshots: [
      "https://cdn.akamai.steamstatic.com/steam/apps/1672970/library_hero.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_46ee31494b5d144d5ef6670cb5a1564abbc26fab.1920x1080.jpg?t=1717003107",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_73b488e696e3ae45f5d0a5750de524c231dab8a2.1920x1080.jpg?t=1717003107",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_9cb3efba6636610ec78eddd550147ed5ee7be3a0.1920x1080.jpg?t=1717003107",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_52883e4263c8f8bca14236118ab62c0f70f2c8d0.1920x1080.jpg?t=1717003107",
      "https://cdn.akamai.steamstatic.com/steam/apps/1672970/header.jpg",
    ]},
    Fortnite: { poster: "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg", screenshots: [
      "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg",
      "https://fortnite-api.com/images/map_en.png", "https://fortnite-api.com/images/map.png",
    ]},
    "League of Legends": { poster: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/MissFortune_0.jpg", screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/c/ca/League_of_Legends_Screenshot_2018.png",
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg", "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg",
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg", "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg",
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ezreal_0.jpg",
    ]},
    "World of Warcraft": { poster: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/header.jpg?t=1782870674", screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_a70cbc9141d47a6e97f03da381a05bda44ceb847.1920x1080.jpg?t=1782870674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_2899439a93eb6a2997d79c9cc90ff4a647d0cd43.1920x1080.jpg?t=1782870674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_d9c35de6f0fcce01750553bbdeb5e2957ffa2f4a.1920x1080.jpg?t=1782870674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_7773904df857e65cc557a72d2026bafd5d1e1095.1920x1080.jpg?t=1782870674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_79bd130929eb3d0ca61c6fa54a8d42340142bca1.1920x1080.jpg?t=1782870674",
    ]},
    "Call of Duty: Modern Warfare III": { poster: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/7d0f21912a075c33bbb5ea558100e187ceb234ac/header.jpg?t=1778886604", steamAppId: 2519060, screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/8694e5cb8262343c867d8f8edb70526b19b49cf8/ss_8694e5cb8262343c867d8f8edb70526b19b49cf8.1920x1080.jpg?t=1778886604",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/757e49ee3ff2b6ebf60e479731d983cec47faa41/ss_757e49ee3ff2b6ebf60e479731d983cec47faa41.1920x1080.jpg?t=1778886604",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/f713211188a2a872d638089b2d959a337639e91a/ss_f713211188a2a872d638089b2d959a337639e91a.1920x1080.jpg?t=1778886604",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/ee37e2686b1a21ede5b74e853d046ba9bd087878/ss_ee37e2686b1a21ede5b74e853d046ba9bd087878.1920x1080.jpg?t=1778886604",
    ]},
    Valorant: { poster: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/stylizedbackgroundimage.png", screenshots: [
      "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
      "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
      "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
      "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
    ]},
    Bloodborne: { poster: "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bloodborne_Cover_Wallpaper.jpg/1920px-Bloodborne_Cover_Wallpaper.jpg", screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/3/36/Bloodborne_Alpha_PlayStation_4_gameplay_screenshot.png",
      "https://images7.alphacoders.com/130/thumb-1920-1305260.jpeg",
    ]},
  };

  await connectDB();
  let updated = 0;
  for (const [title, media] of Object.entries(GAME_MEDIA)) {
    const update = { poster: media.poster, backdrop: media.poster, screenshots: media.screenshots };
    if (media.steamAppId) update.steamAppId = media.steamAppId;
    const result = await Game.updateOne({ title, isActive: true }, { $set: update });
    if (result.matchedCount === 0) console.log(`NOT FOUND: ${title}`);
    else { updated++; console.log(`FIXED: ${title}`); }
  }
  console.log(`\nDone — fixed ${updated}/${Object.keys(GAME_MEDIA).length} games`);
  await mongoose.disconnect();
}

// ─── fixWolverinePoster ───────────────────────────────────
export async function fixWolverinePoster() {
  const POSTER = "https://image.api.playstation.com/vulcan/ap/rnd/202605/2215/a69481c5fa50fe19f42896d84fb7cbf37ab8646801a93322.png";
  const SCREENSHOTS = [
    POSTER,
    "https://image.api.playstation.com/vulcan/ap/rnd/202510/0721/e54995d925972b21f0092d0f27a4884f2c883c439514dede.png",
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/2e98d11ecc5fc86cf404d0f4b7b4a1ba5774a51bf3db0020.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/5ba04b023e0b4c4aa7fbdbf2170262a52bc0384ee44efce0.jpg",
    "https://sm.ign.com/t/ign_za/photo/default/4fff4e3964b95d390d4ed47a03083ea07096a58e-scaled-174541133221_feeu.1400.jpg",
    "https://image.api.playstation.com/vulcan/ap/rnd/202605/2221/bc854cdd9ee7b344fd1ad343a9eff5911ae8c08cb0d284cb.jpg",
  ];
  await connectDB();
  const result = await Game.updateOne({ title: "Marvel's Wolverine", isActive: true }, { $set: { poster: POSTER, backdrop: POSTER, screenshots: SCREENSHOTS }, $unset: { steamAppId: "" } });
  console.log(result.matchedCount === 0 ? "Marvel's Wolverine not found" : "Fixed Marvel's Wolverine");
  await mongoose.disconnect();
}

// ─── updateNintendoPosters ────────────────────────────────
export async function updateNintendoPosters() {
  const UPDATES = {
    "Metroid Prime 4: Beyond": "https://assets.nintendo.com/image/upload/f_auto/q_auto/c_scale,w_1920/Marketing/68272fb37fa56918996af8bfceddbc4223c2746af7c325b2067f0c62c65ef8c0/pmp_lksadf/introduction/keyart-large",
    "The Legend of Zelda: Breath of the Wild": "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_2.0/c_scale,w_1920/ncom/en_US/games/switch/t/the-legend-of-zelda-breath-of-the-wild-switch/hero",
  };
  await connectDB();
  for (const [title, poster] of Object.entries(UPDATES)) {
    const result = await Game.updateOne({ title, isActive: true }, { $set: { poster, backdrop: poster } });
    console.log(result.matchedCount === 0 ? `NOT FOUND: ${title}` : `UPDATED: ${title}`);
  }
  await mongoose.disconnect();
}

// ─── fixZeldaMedia ────────────────────────────────────────
export async function fixZeldaMedia() {
  const POSTER =
    "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_2.0/c_scale,w_1920/ncom/en_US/games/switch/t/the-legend-of-zelda-breath-of-the-wild-switch/hero";
  const BACKDROP =
    "https://assets.nintendo.com/image/upload/f_auto/q_auto/c_scale,w_1920/Marketing/68272fb37fa56918996af8bfceddbc4223c2746af7c325b2067f0c62c65ef8c0/pmp_lhsdvby/parallax/link-landscape-small-bg-2x";
  const SCREENSHOT_BASE =
    "https://assets.nintendo.com/image/upload/f_auto/q_auto/c_scale,w_1920/store/software/switch/70010000000025/";
  const SCREENSHOTS = [
    POSTER,
    `${SCREENSHOT_BASE}7137262b5a64d921e193653f8aa0b722925abc5680380ca0e18a5cfd91697f58`,
    `${SCREENSHOT_BASE}eb82bc845c62948e12a4b7c8c241a22bf6d2acc9cbe7db00898926d861adf0ae`,
    `${SCREENSHOT_BASE}37559b8fa80cf0708c8dcef23ef4fea9af26d997a7c6f981565bc50eeaa3cc0f`,
    `${SCREENSHOT_BASE}b478fce889ed0237b252978f046884121f6be959f5b4b62e4fc03970bd617647`,
    `${SCREENSHOT_BASE}68f832d604ad2a85fa3dda00ae5345232fe271e01df40a48bb1fb2ed291f92f4`,
    `${SCREENSHOT_BASE}0375d13a121f32ff06ef96aac1919b138f3ebe13e40cc0b2de7d39237b87fb86`,
    `${SCREENSHOT_BASE}8f7854a3b7271d364e1e421aced946982235d22b420e1a0cec5296a62d97c225`,
  ];

  await connectDB();
  const result = await Game.updateOne(
    { title: "The Legend of Zelda: Breath of the Wild", isActive: true },
    { $set: { poster: POSTER, backdrop: BACKDROP, screenshots: SCREENSHOTS } }
  );

  if (result.matchedCount === 0) {
    console.log("Zelda game not found");
  } else {
    console.log("Fixed The Legend of Zelda: Breath of the Wild media");
    console.log(`  poster: ${POSTER}`);
    console.log(`  screenshots: ${SCREENSHOTS.length} official Nintendo images`);
  }

  await mongoose.disconnect();
}

// ─── restoreGameMedia ─────────────────────────────────────
export async function restoreGameMedia() {
  await connectDB();
  const games = await Game.find({ isActive: true });
  let updated = 0;
  for (const game of games) {
    const update = {};
    const appId = extractSteamAppId(game);
    if (!game.backdrop && game.poster) update.backdrop = game.poster;
    if (!game.screenshots?.length) {
      if (appId) {
        const base = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}`;
        const screenshots = [game.poster, `${base}/header.jpg`, `${base}/library_hero.jpg`, `${base}/capsule_616x353.jpg`].filter(Boolean);
        update.screenshots = [...new Set(screenshots)];
        update.steamAppId = Number(appId);
      } else if (game.poster) {
        update.screenshots = [game.poster];
        if (!update.backdrop) update.backdrop = game.poster;
      }
    }
    if (Object.keys(update).length > 0) {
      await Game.updateOne({ _id: game._id }, { $set: update });
      updated++;
    }
  }
  console.log(`Done — restored ${updated} of ${games.length} games`);
  await mongoose.disconnect();
}

// ─── findVerticalPosters ──────────────────────────────────
export async function findAndReplaceVertical() {
  const fallbacks = {
    "Doom: The Dark Ages": 3017860, "Borderlands 4": 1285190, "Elden Ring Nightreign": 2622380,
    "Mafia: The Old Country": 1941540, "Like a Dragon: Pirate Yakuza in Hawaii": 3061810,
    "Clair Obscur: Expedition 33": 1903340, "South of Midnight": 1934570,
    "Death Stranding 2: On the Beach": 3280350, Avowed: 2457220, Atomfall: 801800,
    "Gears of War: E-Day": 3010850, "The First Berserker: Khazan": 2680010, Fable: 2769570,
    "Grand Theft Auto V": 271590, "Mass Effect 5": 1328670,
  };
  await connectDB();
  const games = await Game.find({}).select("title poster").lean();
  let updated = 0;
  for (const g of games) {
    if (!/wikipedia|upload\.wikimedia/i.test(g.poster || "")) continue;
    const steamId = fallbacks[g.title];
    if (steamId) {
      const newPoster = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamId}/header.jpg`;
      await Game.findByIdAndUpdate(g._id, { $set: { poster: newPoster } });
      console.log(`  Updated: ${g.title}`);
      updated++;
    } else console.log(`  PORTRAIT: ${g.title}`);
  }
  console.log(`\nUpdated ${updated} games`);
  await mongoose.disconnect();
}

// ─── CLI dispatch ─────────────────────────────────────────
const tasks = { fixPosters, fixBrokenMedia, fixWolverinePoster, updateNintendoPosters, fixZeldaMedia, restoreGameMedia, findAndReplaceVertical };
const task = process.argv[2];
if (tasks[task]) tasks[task]().catch((e) => { console.error(e); process.exit(1); });
else console.log(`Usage: node fixGameMedia.js <${Object.keys(tasks).join("|")}>`);
