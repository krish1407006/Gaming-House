import "dotenv/config";
import axios from "axios";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const UA = "Mozilla/5.0";

// Games still missing screenshots + image sources
const fixes = {
  "Alan Wake 2": [
    "https://www.newgamenetwork.com/images/uploads/gallery/AlanWake2/aw2_08.jpg",
    "https://www.newgamenetwork.com/images/uploads/gallery/AlanWake2/aw2_10.jpg",
    "https://www.newgamenetwork.com/images/uploads/gallery/AlanWake2/aw2_02.jpg",
  ],
};

async function getWikipediaUrl(filename) {
  try {
    const { data } = await axios.get(
      "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&titles=" +
        encodeURIComponent(filename) +
        "&iiprop=url&format=json&origin=*",
      { timeout: 10000, headers: { "User-Agent": UA } }
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

// Non-Steam games: try to find Wikipedia screenshots
const wikiFiles = {
  "The Legend of Zelda: Breath of the Wild": [
    "File:Breath of the Wild paraglide.jpg",
  ],
  "Minecraft": [
    "File:Oasis (Minecraft) gameplay screenshot.jpg",
    "File:Minecraft Multiplayer Fun.png",
  ],
  "League of Legends": [
    "File:LOL logo esports.svg",
  ],
  "World of Warcraft": [
    "File:World of Warcraft Box Art.jpg",
  ],
};

async function main() {
  await connectDB();

  // Phase 1: hardcoded fixes
  for (const [title, urls] of Object.entries(fixes)) {
    const game = await Game.findOne({ title });
    if (!game) { console.log(`❌ NOT FOUND: ${title}`); continue; }
    await Game.findByIdAndUpdate(game._id, { $set: { screenshots: urls } });
    console.log(`✅ ${title}: ${urls.length} screenshots (hardcoded)`);
  }

  // Phase 2: Wikipedia files
  for (const [title, files] of Object.entries(wikiFiles)) {
    const game = await Game.findOne({ title });
    if (!game) { console.log(`❌ NOT FOUND: ${title}`); continue; }

    const existing = game.screenshots?.length || 0;
    if (existing >= 3) { console.log(`⏭️ ${title}: already has ${existing} screenshots`); continue; }

    console.log(`Fetching Wikipedia images for: ${title}...`);
    const urls = [];
    for (const file of files) {
      const url = await getWikipediaUrl(file);
      if (url) urls.push(url);
      await new Promise((r) => setTimeout(r, 1000));
    }

    if (urls.length > 0) {
      const all = [...new Set([...(game.screenshots || []), ...urls])];
      await Game.findByIdAndUpdate(game._id, { $set: { screenshots: all } });
      console.log(`  ✅ ${urls.length} new images (total: ${all.length})`);
    } else {
      console.log(`  ❌ No images found for ${title}`);
    }
  }

  // Phase 3: remaining non-Steam games - skip (no reliable source)
  console.log("\n⏭️ Skipped (no reliable source):");
  const skipped = ["Valorant", "Fortnite", "Gran Turismo 7"];
  for (const t of skipped) {
    const g = await Game.findOne({ title: t }).select("title screenshots").lean();
    console.log(`  ${t}: ${g?.screenshots?.length || 0} screenshots`);
  }

  console.log("\nDone!");
  process.exit(0);
}

main();
