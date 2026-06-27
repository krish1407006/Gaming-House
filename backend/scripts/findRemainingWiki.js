import "dotenv/config";
import axios from "axios";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const UA = "Mozilla/5.0";

async function searchWikiFiles(query) {
  try {
    const { data } = await axios.get(
      "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
        encodeURIComponent(query) +
        "&srnamespace=6&format=json&origin=*&srlimit=5",
      { timeout: 10000, headers: { "User-Agent": UA } }
    );
    return data.query.search.map(s => s.title);
  } catch {
    return [];
  }
}

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

async function main() {
  await connectDB();

  const remaining = ["League of Legends", "World of Warcraft", "Valorant", "Fortnite", "Gran Turismo 7"];

  for (const title of remaining) {
    const game = await Game.findOne({ title });
    if (!game) { console.log(`❌ NOT FOUND: ${title}`); continue; }

    const existing = game.screenshots?.length || 0;
    if (existing >= 2) { console.log(`⏭️ ${title}: already has ${existing}`); continue; }

    console.log(`Searching Wikipedia for: ${title}...`);
    const files = await searchWikiFiles(`"${title}" screenshot`);

    const urls = [];
    for (const f of files) {
      if (urls.length >= 3) break;
      const url = await getWikipediaUrl(f);
      if (url && url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) && !url.includes(".svg")) {
        urls.push(url);
        console.log(`  Found: ${f}`);
      }
      await new Promise((r) => setTimeout(r, 800));
    }

    if (urls.length > 0) {
      const all = [...new Set([...(game.screenshots || []), ...urls])];
      await Game.findByIdAndUpdate(game._id, { $set: { screenshots: all } });
      console.log(`✅ ${title}: ${urls.length} new images (total: ${all.length})`);
    } else {
      console.log(`❌ ${title}: no images found`);
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

main();
