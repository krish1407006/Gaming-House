import "dotenv/config";
import mongoose from "mongoose";
import axios from "axios";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

const candidateMap = {
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

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
    } catch (e) {
      if (e.response?.status === 429) {
        await delay(5000);
      } else {
        await delay(1000);
      }
    }
  }
  return false;
}

async function main() {
  try {
    await connectDB();
    const titles = Object.keys(candidateMap);
    let updated = 0;

    for (const title of titles) {
      const urls = candidateMap[title];
      if (!urls.length) {
        console.log(`\n${title}: No candidates`);
        continue;
      }

      console.log(`\n${title}: Testing ${urls.length} URLs...`);
      const working = [];

      for (let i = 0; i < urls.length; i++) {
        process.stdout.write(`  [${i + 1}/${urls.length}] `);
        const ok = await verifyUrl(urls[i]);
        console.log(ok ? "\u2713" : "\u2717");
        if (ok) working.push(urls[i]);
        await delay(3000);
      }

      if (working.length >= 1) {
        const existing = await Game.findOne({ title }, { screenshots: 1 });
        const merged = [...new Set([...working, ...(existing?.screenshots || [])])].filter(
          (u) => !u.includes("0x") || u === working.find((w) => w.includes("0x"))
        );
        await Game.findOneAndUpdate({ title }, { $set: { screenshots: working } });
        console.log(`  \u2192 Updated with ${working.length} screenshots`);
        updated++;
      } else {
        console.log(`  \u2192 No working URLs - keeping existing`);
      }
    }

    console.log(`\nDone. Updated ${updated}/${titles.length} games.`);
    process.exit(0);
  } catch (err) {
    console.error("Fatal:", err);
    process.exit(1);
  }
}

main();
