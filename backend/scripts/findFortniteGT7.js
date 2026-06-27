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
        "&srnamespace=6&format=json&origin=*&srlimit=10",
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

  const searches = {
    "Gran Turismo 7": ['"Gran Turismo 7" screenshot filetype:png OR filetype:jpg', '"Gran Turismo 7" gameplay', "Gran Turismo 7 screenshot", 'Gran Turismo 7 racing gameplay screenshot'],
  };

  for (const [title, queries] of Object.entries(searches)) {
    const game = await Game.findOne({ title });
    if (!game) { console.log(`❌ NOT FOUND: ${title}`); continue; }

    const existing = game.screenshots?.length || 0;
    if (existing >= 2) { console.log(`⏭️ ${title}: already has ${existing}`); continue; }

    const found = new Set();
    for (const q of queries) {
      const files = await searchWikiFiles(q);
      for (const f of files) {
        if (found.size >= 3) break;
        const url = await getWikipediaUrl(f);
        if (url && url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) && !url.includes(".svg")) {
          found.add(url);
          console.log(`  [${title}] ${f}`);
        }
        await new Promise((r) => setTimeout(r, 500));
      }
      if (found.size >= 3) break;
    }

    const urls = [...found];
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
