import "dotenv/config";
import mongoose from "mongoose";
import axios from "axios";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const UA = "Mozilla/5.0";

const steamAppIDs = {
  "Resident Evil 2 Remake": 883710,
  "Resident Evil 3 Remake": 952420,
  "Resident Evil 7: Biohazard": 418370,
  "Resident Evil Village": 1196590,
  "Resident Evil 5": 21690,
  "Resident Evil 0": 339340,
  "Like a Dragon: Pirate Yakuza in Hawaii": 3061810,
  "The First Berserker: Khazan": 3236820,
  "Atomfall": 801800,
  "Mafia: The Old Country": 1941540,
  "Clair Obscur: Expedition 33": 1903340,
  "Doom: The Dark Ages": 3017860,
  "Death Stranding 2: On the Beach": 3280350,
  "Avowed": 2457220,
  "Borderlands 4": 1285190,
  "Elden Ring Nightreign": 2622380,
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
  } catch {
    return [];
  }
}

const wikipediaCandidates = {
  "Grand Theft Auto VI": [
    "File:Grand Theft Auto VI.png",
    "File:Grand Theft Auto VI screenshot.png",
  ],
  "Doom: The Dark Ages": [
    "File:DOOM, The Dark Ages Game Cover.jpeg",
    "File:Doom The Dark Ages gameplay.jpg",
  ],
  "Ghost of Yotei": [
    "File:Ghost of Yotei gameplay screenshot.jpg",
  ],
  "Clair Obscur: Expedition 33": [
    "File:Clair Obscur, Expedition 33 Cover 1.webp",
    "File:Clair Obscur gameplay screenshot.png",
  ],
  "South of Midnight": [
    "File:South of Midnight cover art.jpeg",
    "File:South of Midnight gameplay screenshot.jpg",
  ],
  "Metroid Prime 4: Beyond": [
    "File:Metroid Prime 4 Beyond cover art.png",
    "File:Prime4Gameplay.png",
  ],
  "Gears of War: E-Day": [
    "File:Gears of War E-Day cover art.png",
    "File:Gears of War E-Day gameplay.jpg",
  ],
};

async function getWikipediaImageUrl(filename) {
  try {
    const { data } = await axios.get(
      "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&titles=" +
        encodeURIComponent(filename) +
        "&iiprop=url&format=json&origin=*",
      { timeout: 15000, headers: { "User-Agent": UA } }
    );
    for (const k of Object.keys(data.query.pages)) {
      if (data.query.pages[k]?.imageinfo?.[0]?.url) {
        return data.query.pages[k].imageinfo[0].url;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function verifyUrl(url) {
  try {
    const r = await axios.get(url, { timeout: 10000, headers: { "User-Agent": UA }, responseType: "stream" });
    return r.status === 200 && parseInt(r.headers["content-length"] || "0") > 1000;
  } catch {
    return false;
  }
}

async function main() {
  await connectDB();
  const now = Date.now();

  // Phase 1: Steam API
  for (const [title, appId] of Object.entries(steamAppIDs)) {
    const game = await Game.findOne({ title });
    if (!game) { console.log(`NOT FOUND: ${title}`); continue; }

    const existingCount = game.screenshots?.length || 0;
    if (existingCount >= 5) { console.log(`  ${title}: already has ${existingCount}, skipping`); continue; }

    console.log(`Fetching Steam screenshots for: ${title} (app ${appId})...`);
    const urls = await fetchSteamScreenshots(appId);
    if (urls.length >= 3) {
      await Game.findByIdAndUpdate(game._id, { $set: { screenshots: urls, poster: urls[0] } });
      console.log(`  ✅ ${urls.length} screenshots`);
    } else {
      console.log(`  ❌ Only ${urls.length} screenshots from Steam`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Phase 2: Wikipedia images for games not on Steam
  for (const [title, files] of Object.entries(wikipediaCandidates)) {
    const game = await Game.findOne({ title });
    if (!game) { console.log(`NOT FOUND: ${title}`); continue; }

    const existingCount = game.screenshots?.length || 0;
    if (existingCount >= 5) { console.log(`  ${title}: already has ${existingCount} screenshots, skipping`); continue; }

    console.log(`Fetching Wikipedia images for: ${title}...`);
    const urls = [];
    for (const file of files) {
      const url = await getWikipediaImageUrl(file);
      if (url) {
        const ok = await verifyUrl(url);
        if (ok) urls.push(url);
      }
      await new Promise((r) => setTimeout(r, 1500));
    }

    if (urls.length > 0) {
      const all = [...new Set([...(game.screenshots || []), ...urls])];
      await Game.findByIdAndUpdate(game._id, { $set: { screenshots: all } });
      console.log(`  ✅ ${urls.length} new images (total: ${all.length})`);
    }
  }

  // Summary
  console.log("\n=== FINAL SUMMARY ===");
  const titles = [...Object.keys(steamAppIDs), ...Object.keys(wikipediaCandidates)];
  for (const t of [...new Set(titles)]) {
    const g = await Game.findOne({ title: t }).lean();
    if (g) console.log(`${t}: ${g.screenshots?.length || 0} screenshots`);
  }

  const elapsed = ((Date.now() - now) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s`);
  process.exit(0);
}

main();
