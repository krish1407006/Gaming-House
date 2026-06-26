import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const updates = {
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
    "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/WoW_Dragonflight_screenshot.jpg/1280px-WoW_Dragonflight_screenshot.jpg",
  ],
  "Gran Turismo 7": [
    "https://images8.alphacoders.com/136/1361458.jpeg",
  ],
  Fortnite: [
    "https://cdn-live.prm.ol.epicgames.com/prod/65e934f81dbe4e1c88dd39a96f380f03.jpeg?width=1920&height=1080&aspect=fill",
    "https://cdn-live.prm.ol.epicgames.com/prod/73f4bb54261244f6a37e27086c9c9992.jpeg?width=1920&height=1080&aspect=fill",
    "https://cdn-live.prm.ol.epicgames.com/prod/120944260e304a5db1050b1fe497fa32.jpeg?width=1920&height=1080&aspect=fill",
    "https://cdn-live.prm.ol.epicgames.com/prod/578f49980eca41e68aeb590b5cd58907.jpeg?width=1920&height=1080&aspect=fill",
    "https://cdn-live.prm.ol.epicgames.com/prod/61881e785e53463e80e90bd51bfe8f5d.jpeg?width=1920&height=1080&aspect=fill",
  ],
};

async function main() {
  try {
    await connectDB();
    let count = 0;
    for (const [title, screenshots] of Object.entries(updates)) {
      await Game.findOneAndUpdate({ title }, { $set: { screenshots } });
      console.log(`${title}: ${screenshots.length} screenshots`);
      count++;
    }
    console.log(`\nDone. Updated ${count} games.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
