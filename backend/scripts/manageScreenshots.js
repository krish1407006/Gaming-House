import "dotenv/config";
import mongoose from "mongoose";
import axios from "axios";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

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

const nonSteamScreenshots = {
  Bloodborne: [
    "https://upload.wikimedia.org/wikipedia/en/3/36/Bloodborne_Alpha_PlayStation_4_gameplay_screenshot.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bloodborne_Cover_Wallpaper.jpg/1280px-Bloodborne_Cover_Wallpaper.jpg",
  ],
  Minecraft: [
    "https://upload.wikimedia.org/wikipedia/commons/c/cd/Screenshot_from_the_Minecraft_Nether.png",
    "https://upload.wikimedia.org/wikipedia/commons/0/0f/Screenshot_from_the_Minecraft_End.png",
    "https://upload.wikimedia.org/wikipedia/commons/5/53/Minecraft_Beta_1.8.1_Gameplay_Screenshot.png",
  ],
  "The Legend of Zelda: Breath of the Wild": [
    "https://upload.wikimedia.org/wikipedia/en/b/b3/Breath_of_the_Wild_paraglide.jpg",
    "https://upload.wikimedia.org/wikipedia/en/c/ce/Climbing_in_BotW.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b1/E3_-_2016_%2827647046866%29.jpg",
  ],
  "League of Legends": [
    "https://upload.wikimedia.org/wikipedia/en/c/ca/League_of_Legends_Screenshot_2018.png",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ezreal_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Akali_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Darius_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg",
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Thresh_0.jpg",
  ],
  Valorant: [
    "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png",
    "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/fullportrait.png",
    "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/fullportrait.png",
    "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/fullportrait.png",
  ],
  "World of Warcraft": [
    "https://upload.wikimedia.org/wikipedia/en/6/65/World_of_Warcraft.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/4/49/World_of_Warcraft_screenshot.jpg/1280px-World_of_Warcraft_screenshot.jpg",
  ],
  "Gran Turismo 7": [
    "https://images8.alphacoders.com/136/1361458.jpeg",
  ],
  Fortnite: [],
};

const wikipediaCandidates = {
  "Grand Theft Auto VI": [
    "File:Grand Theft Auto VI.png",
    "File:Grand Theft Auto VI screenshot.png",
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

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchSteamScreenshots(appId, maxCount = 6) {
  try {
    const { data } = await axios.get(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=en&cc=US`,
      { timeout: 15000, headers: { "User-Agent": UA } }
    );
    if (data[appId]?.success && data[appId]?.data?.screenshots) {
      return data[appId].data.screenshots.slice(0, maxCount).map((s) =>
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

async function verifyUrl(url, timeout = 20000) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await axios.get(url, {
        timeout,
        responseType: "stream",
        maxRedirects: 5,
        headers: { "User-Agent": UA },
      });
      if (res.status >= 200 && res.status < 400) return true;
    } catch {
      await delay(1000);
    }
  }
  return false;
}

async function main() {
  const mode = process.argv[2] || "steam";
  await connectDB();

  if (mode === "steam") {
    for (const [title, appId] of Object.entries(steamAppIds)) {
      const game = await Game.findOne({ title });
      if (!game) { console.log(`NOT FOUND: ${title}`); continue; }
      if ((game.screenshots?.length || 0) >= 5) { console.log(`  ${title}: already has ${game.screenshots.length}, skipping`); continue; }

      console.log(`Fetching Steam screenshots for: ${title}...`);
      const urls = await fetchSteamScreenshots(appId);
      if (urls.length >= 1) {
        await Game.findByIdAndUpdate(game._id, { $set: { screenshots: urls } });
        console.log(`  \u2713 ${urls.length} screenshots`);
      } else {
        console.log(`  \u2717 No screenshots from Steam`);
      }
      await delay(1500);
    }
  }

  if (mode === "nonsteam") {
    for (const [title, urls] of Object.entries(nonSteamScreenshots)) {
      if (!urls.length) { console.log(`${title}: No candidates`); continue; }
      const game = await Game.findOne({ title });
      if (!game) { console.log(`NOT FOUND: ${title}`); continue; }

      console.log(`${title}: Testing ${urls.length} URLs...`);
      const working = [];
      for (const url of urls) {
        const ok = await verifyUrl(url);
        if (ok) working.push(url);
        await delay(3000);
      }
      if (working.length >= 1) {
        await Game.findOneAndUpdate({ title }, { $set: { screenshots: working } });
        console.log(`  \u2192 Updated with ${working.length} screenshots`);
      } else {
        console.log(`  \u2192 No working URLs`);
      }
    }
  }

  if (mode === "wikipedia") {
    for (const [title, files] of Object.entries(wikipediaCandidates)) {
      const game = await Game.findOne({ title });
      if (!game) { console.log(`NOT FOUND: ${title}`); continue; }
      if ((game.screenshots?.length || 0) >= 5) { console.log(`  ${title}: already has ${game.screenshots.length}, skipping`); continue; }

      console.log(`Fetching Wikipedia images for: ${title}...`);
      const urls = [];
      for (const file of files) {
        const url = await getWikipediaImageUrl(file);
        if (url) {
          const ok = await verifyUrl(url);
          if (ok) urls.push(url);
        }
        await delay(1500);
      }
      if (urls.length > 0) {
        const all = [...new Set([...(game.screenshots || []), ...urls])];
        await Game.findByIdAndUpdate(game._id, { $set: { screenshots: all } });
        console.log(`  \u2713 ${urls.length} new images (total: ${all.length})`);
      }
    }
  }

  if (mode === "all") {
    await Game.updateMany({ screenshots: { $exists: false } }, { $set: { screenshots: [] } });
  }

  console.log("\nDone");
  process.exit(0);
}

main();
