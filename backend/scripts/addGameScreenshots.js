import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const steamUrl = (appId, type = "library_hero") =>
  `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/${type}.jpg`;

const gameImages = [
  {
    title: "Elden Ring",
    screenshots: [
      steamUrl(1245620, "library_hero"),
      steamUrl(1245620, "page_bg_generated_v6b"),
      steamUrl(1245620, "capsule_616x353"),
      steamUrl(1245620, "library_600x900"),
    ],
  },
  {
    title: "The Legend of Zelda: Breath of the Wild",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/The_Legend_of_Zelda_Breath_of_the_Wild_artwork.jpg/1280px-The_Legend_of_Zelda_Breath_of_the_Wild_artwork.jpg",
      "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_1200/ncom/software/switch/70010000000025/713d2b5a1b3b6b6c0b6c6d6e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
      "https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_1200/ncom/software/switch/70010000000025/3b0d5c5a5f9c4a4b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6",
      "https://cdn02.nintendo-europe.com/media/images/10_share_images/games_15/nintendo_switch_4/H2x1_NSwitch_TheLegendOfZeldaBreathOfTheWild_image1600w.jpg",
    ],
  },
  {
    title: "Cyberpunk 2077",
    screenshots: [
      steamUrl(1091500, "library_hero"),
      steamUrl(1091500, "page_bg_generated_v6b"),
      steamUrl(1091500, "capsule_616x353"),
      steamUrl(1091500, "library_600x900"),
    ],
  },
  {
    title: "God of War Ragnarök",
    screenshots: [
      steamUrl(2322010, "library_hero"),
      steamUrl(2322010, "page_bg_generated_v6b"),
      steamUrl(2322010, "capsule_616x353"),
      steamUrl(2322010, "library_600x900"),
    ],
  },
  {
    title: "Baldur's Gate 3",
    screenshots: [
      steamUrl(1086940, "library_hero"),
      steamUrl(1086940, "page_bg_generated_v6b"),
      steamUrl(1086940, "capsule_616x353"),
      steamUrl(1086940, "library_600x900"),
    ],
  },
  {
    title: "Hogwarts Legacy",
    screenshots: [
      steamUrl(990080, "library_hero"),
      steamUrl(990080, "page_bg_generated_v6b"),
      steamUrl(990080, "capsule_616x353"),
      steamUrl(990080, "library_600x900"),
    ],
  },
  {
    title: "The Witcher 3: Wild Hunt",
    screenshots: [
      steamUrl(292030, "library_hero"),
      steamUrl(292030, "page_bg_generated_v6b"),
      steamUrl(292030, "capsule_616x353"),
      steamUrl(292030, "library_600x900"),
    ],
  },
  {
    title: "Red Dead Redemption 2",
    screenshots: [
      steamUrl(1174180, "library_hero"),
      steamUrl(1174180, "page_bg_generated_v6b"),
      steamUrl(1174180, "capsule_616x353"),
      steamUrl(1174180, "library_600x900"),
    ],
  },
  {
    title: "Ghost of Tsushima",
    screenshots: [
      steamUrl(2215430, "library_hero"),
      steamUrl(2215430, "page_bg_generated_v6b"),
      steamUrl(2215430, "capsule_616x353"),
      steamUrl(2215430, "library_600x900"),
    ],
  },
  {
    title: "Final Fantasy XVI",
    screenshots: [
      steamUrl(2515020, "library_hero"),
      steamUrl(2515020, "page_bg_generated_v6b"),
      steamUrl(2515020, "capsule_616x353"),
      steamUrl(2515020, "library_600x900"),
    ],
  },
  {
    title: "Starfield",
    screenshots: [
      steamUrl(1716740, "library_hero"),
      steamUrl(1716740, "page_bg_generated_v6b"),
      steamUrl(1716740, "capsule_616x353"),
      steamUrl(1716740, "library_600x900"),
    ],
  },
  {
    title: "Palworld",
    screenshots: [
      steamUrl(1623730, "library_hero"),
      steamUrl(1623730, "page_bg_generated_v6b"),
      steamUrl(1623730, "capsule_616x353"),
      steamUrl(1623730, "library_600x900"),
    ],
  },
  {
    title: "Dragon's Dogma 2",
    screenshots: [
      steamUrl(2054970, "library_hero"),
      steamUrl(2054970, "page_bg_generated_v6b"),
      steamUrl(2054970, "capsule_616x353"),
      steamUrl(2054970, "library_600x900"),
    ],
  },
  {
    title: "Helldivers 2",
    screenshots: [
      steamUrl(553850, "library_hero"),
      steamUrl(553850, "page_bg_generated_v6b"),
      steamUrl(553850, "capsule_616x353"),
      steamUrl(553850, "library_600x900"),
    ],
  },
  {
    title: "Tekken 8",
    screenshots: [
      steamUrl(1778820, "library_hero"),
      steamUrl(1778820, "page_bg_generated_v6b"),
      steamUrl(1778820, "capsule_616x353"),
      steamUrl(1778820, "library_600x900"),
    ],
  },
  {
    title: "Final Fantasy VII Remake",
    screenshots: [
      steamUrl(1462040, "library_hero"),
      steamUrl(1462040, "page_bg_generated_v6b"),
      steamUrl(1462040, "capsule_616x353"),
      steamUrl(1462040, "library_600x900"),
    ],
  },
  {
    title: "Dark Souls III",
    screenshots: [
      steamUrl(374320, "library_hero"),
      steamUrl(374320, "page_bg_generated_v6b"),
      steamUrl(374320, "capsule_616x353"),
      steamUrl(374320, "library_600x900"),
    ],
  },
  {
    title: "Bloodborne",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bloodborne_Cover_Wallpaper.jpg/1280px-Bloodborne_Cover_Wallpaper.jpg",
      "https://cdn.cloudflare.steamstatic.com/steam/apps/256838252/movie600.mp4.jpg",
      "https://www.playstation.com/en-us/games/bloodborne/",
      "https://media.rawg.io/media/games/14a/14a0c1c8c8c8c8c8c8c8c8c8c8c8c8c8.jpg",
    ],
  },
  {
    title: "Monster Hunter: World",
    screenshots: [
      steamUrl(582160, "library_hero"),
      steamUrl(582160, "page_bg_generated_v6b"),
      steamUrl(582160, "capsule_616x353"),
      steamUrl(582160, "library_600x900"),
    ],
  },
  {
    title: "Metal Gear Solid V: The Phantom Pain",
    screenshots: [
      steamUrl(287700, "library_hero"),
      steamUrl(287700, "page_bg_generated_v6b"),
      steamUrl(287700, "capsule_616x353"),
      steamUrl(287700, "library_600x900"),
    ],
  },
  {
    title: "Death Stranding",
    screenshots: [
      steamUrl(1850570, "library_hero"),
      steamUrl(1850570, "page_bg_generated_v6b"),
      steamUrl(1850570, "capsule_616x353"),
      steamUrl(1850570, "library_600x900"),
    ],
  },
  {
    title: "Persona 5",
    screenshots: [
      steamUrl(1687950, "library_hero"),
      steamUrl(1687950, "page_bg_generated_v6b"),
      steamUrl(1687950, "capsule_616x353"),
      steamUrl(1687950, "library_600x900"),
    ],
  },
  {
    title: "Devil May Cry 5",
    screenshots: [
      steamUrl(601150, "library_hero"),
      steamUrl(601150, "page_bg_generated_v6b"),
      steamUrl(601150, "capsule_616x353"),
      steamUrl(601150, "library_600x900"),
    ],
  },
  {
    title: "Resident Evil 4 Remake",
    screenshots: [
      steamUrl(2050650, "library_hero"),
      steamUrl(2050650, "page_bg_generated_v6b"),
      steamUrl(2050650, "capsule_616x353"),
      steamUrl(2050650, "library_600x900"),
    ],
  },
  {
    title: "Street Fighter 6",
    screenshots: [
      steamUrl(1364780, "library_hero"),
      steamUrl(1364780, "page_bg_generated_v6b"),
      steamUrl(1364780, "capsule_616x353"),
      steamUrl(1364780, "library_600x900"),
    ],
  },
  {
    title: "Mortal Kombat 1",
    screenshots: [
      steamUrl(1971870, "library_hero"),
      steamUrl(1971870, "page_bg_generated_v6b"),
      steamUrl(1971870, "capsule_616x353"),
      steamUrl(1971870, "library_600x900"),
    ],
  },
  {
    title: "NBA 2K24",
    screenshots: [
      steamUrl(2338770, "library_hero"),
      steamUrl(2338770, "page_bg_generated_v6b"),
      steamUrl(2338770, "capsule_616x353"),
      steamUrl(2338770, "library_600x900"),
    ],
  },
  {
    title: "FC 24",
    screenshots: [
      steamUrl(2195250, "library_hero"),
      steamUrl(2195250, "page_bg_generated_v6b"),
      steamUrl(2195250, "capsule_616x353"),
      steamUrl(2195250, "library_600x900"),
    ],
  },
  {
    title: "Gran Turismo 7",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Gran_Turismo_7_cover_art.jpg/1280px-Gran_Turismo_7_cover_art.jpg",
      "https://www.gran-turismo.com/images/c/01/area/gt7/gt7_hero.jpg",
      "https://image.api.playstation.com/vulcan/ap/rnd/202209/2300/9fGjK4Vh5c7vYd6e8f9g0h1i2j3k4l5m.jpg",
      "https://media.rawg.io/media/games/9bc/9bc7d8e8c8c8c8c8c8c8c8c8c8c8c8c8.jpg",
    ],
  },
  {
    title: "Forza Motorsport",
    screenshots: [
      steamUrl(2440510, "library_hero"),
      steamUrl(2440510, "page_bg_generated_v6b"),
      steamUrl(2440510, "capsule_616x353"),
      steamUrl(2440510, "library_600x900"),
    ],
  },
  {
    title: "Alan Wake 2",
    screenshots: [
      steamUrl(2379780, "library_hero"),
      steamUrl(2379780, "page_bg_generated_v6b"),
      steamUrl(2379780, "capsule_616x353"),
      steamUrl(2379780, "library_600x900"),
    ],
  },
  {
    title: "Star Wars Jedi: Survivor",
    screenshots: [
      steamUrl(1774580, "library_hero"),
      steamUrl(1774580, "page_bg_generated_v6b"),
      steamUrl(1774580, "capsule_616x353"),
      steamUrl(1774580, "library_600x900"),
    ],
  },
  {
    title: "Minecraft",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Minecraft_Logo.png/1280px-Minecraft_Logo.png",
      "https://www.minecraft.net/content/dam/games/minecraft/key-art/PC_Game_Header_1920x1080.jpg",
      "https://www.minecraft.net/content/dam/games/minecraft/screenshots/CaveUpdate_1.jpg",
      "https://www.minecraft.net/content/dam/games/minecraft/screenshots/VillagesUpdate_1.jpg",
    ],
  },
  {
    title: "Fortnite",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Fortnite.png/1280px-Fortnite.png",
      "https://cdn2.unrealengine.com/fortnite-og-1920x1080-5d8c8c8c8c8c.jpg",
      "https://cdn2.unrealengine.com/fortnite-chapter-5-season-1-1920x1080-8c8c8c8c8c8c.jpg",
      "https://cdn2.unrealengine.com/fortnite-battle-royale-1920x1080-8c8c8c8c8c8c.jpg",
    ],
  },
  {
    title: "Call of Duty: Modern Warfare III",
    screenshots: [
      steamUrl(3595270, "library_hero"),
      steamUrl(3595270, "page_bg_generated_v6b"),
      steamUrl(3595270, "capsule_616x353"),
      steamUrl(3595270, "library_600x900"),
    ],
  },
  {
    title: "Grand Theft Auto V",
    screenshots: [
      steamUrl(271590, "library_hero"),
      steamUrl(271590, "page_bg_generated_v6b"),
      steamUrl(271590, "capsule_616x353"),
      steamUrl(271590, "library_600x900"),
    ],
  },
  {
    title: "League of Legends",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/League_of_Legends_2019_vector.svg/1280px-League_of_Legends_2019_vector.svg.png",
      "https://www.riotgames.com/darkroom/1440/66b8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/league-of-legends-2023.jpg",
      "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/lol-worlds-2023.jpg",
      "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/lol-gameplay.jpg",
    ],
  },
  {
    title: "Dota 2",
    screenshots: [
      steamUrl(570, "library_hero"),
      steamUrl(570, "page_bg_generated_v6b"),
      steamUrl(570, "capsule_616x353"),
      steamUrl(570, "library_600x900"),
    ],
  },
  {
    title: "Counter-Strike 2",
    screenshots: [
      steamUrl(730, "library_hero"),
      steamUrl(730, "page_bg_generated_v6b"),
      steamUrl(730, "capsule_616x353"),
      steamUrl(730, "library_600x900"),
    ],
  },
  {
    title: "Valorant",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Valorant_logo_-_pink_color_version.svg/1280px-Valorant_logo_-_pink_color_version.svg.png",
      "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/valorant-2023.jpg",
      "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/valorant-gameplay.jpg",
      "https://www.riotgames.com/darkroom/1440/8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8:3d8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/valorant-agents.jpg",
    ],
  },
  {
    title: "Overwatch 2",
    screenshots: [
      steamUrl(2357570, "library_hero"),
      steamUrl(2357570, "page_bg_generated_v6b"),
      steamUrl(2357570, "capsule_616x353"),
      steamUrl(2357570, "library_600x900"),
    ],
  },
  {
    title: "Apex Legends",
    screenshots: [
      steamUrl(1172470, "library_hero"),
      steamUrl(1172470, "page_bg_generated_v6b"),
      steamUrl(1172470, "capsule_616x353"),
      steamUrl(1172470, "library_600x900"),
    ],
  },
  {
    title: "Warframe",
    screenshots: [
      steamUrl(230410, "library_hero"),
      steamUrl(230410, "page_bg_generated_v6b"),
      steamUrl(230410, "capsule_616x353"),
      steamUrl(230410, "library_600x900"),
    ],
  },
  {
    title: "Path of Exile",
    screenshots: [
      steamUrl(238960, "library_hero"),
      steamUrl(238960, "page_bg_generated_v6b"),
      steamUrl(238960, "capsule_616x353"),
      steamUrl(238960, "library_600x900"),
    ],
  },
  {
    title: "Lost Ark",
    screenshots: [
      steamUrl(1599340, "library_hero"),
      steamUrl(1599340, "page_bg_generated_v6b"),
      steamUrl(1599340, "capsule_616x353"),
      steamUrl(1599340, "library_600x900"),
    ],
  },
  {
    title: "New World",
    screenshots: [
      steamUrl(1063730, "library_hero"),
      steamUrl(1063730, "page_bg_generated_v6b"),
      steamUrl(1063730, "capsule_616x353"),
      steamUrl(1063730, "library_600x900"),
    ],
  },
  {
    title: "Final Fantasy XIV",
    screenshots: [
      steamUrl(39210, "library_hero"),
      steamUrl(39210, "page_bg_generated_v6b"),
      steamUrl(39210, "capsule_616x353"),
      steamUrl(39210, "library_600x900"),
    ],
  },
  {
    title: "World of Warcraft",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/thumb/6/65/World_of_Warcraft.png/1280px-World_of_Warcraft.png",
      "https://blz-contentstack-images.akamaized.net/v3/assets/blt77f8b3b3b3b3b3b3/blt77f8b3b3b3b3b3b3/5c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/wow-hero.jpg",
      "https://blz-contentstack-images.akamaized.net/v3/assets/blt77f8b3b3b3b3b3b3/blt77f8b3b3b3b3b3b3/5c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/wow-dragonflight.jpg",
      "https://blz-contentstack-images.akamaized.net/v3/assets/blt77f8b3b3b3b3b3b3/blt77f8b3b3b3b3b3b3/5c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c/wow-the-war-within.jpg",
    ],
  },
  {
    title: "Halo Infinite",
    screenshots: [
      steamUrl(1240440, "library_hero"),
      steamUrl(1240440, "page_bg_generated_v6b"),
      steamUrl(1240440, "capsule_616x353"),
      steamUrl(1240440, "library_600x900"),
    ],
  },
  {
    title: "Assassin's Creed: Mirage",
    screenshots: [
      steamUrl(2840340, "library_hero"),
      steamUrl(2840340, "page_bg_generated_v6b"),
      steamUrl(2840340, "capsule_616x353"),
      steamUrl(2840340, "library_600x900"),
    ],
  },
  {
    title: "Spider-Man 2",
    screenshots: [
      steamUrl(2651280, "library_hero"),
      steamUrl(2651280, "page_bg_generated_v6b"),
      steamUrl(2651280, "capsule_616x353"),
      steamUrl(2651280, "library_600x900"),
    ],
  },
];

async function addScreenshots() {
  try {
    await connectDB();
    let updated = 0;
    let notFound = [];

    for (const data of gameImages) {
      const result = await Game.findOneAndUpdate(
        { title: data.title },
        { $set: { screenshots: data.screenshots } },
        { new: true }
      );

      if (result) {
        console.log(`✓ ${result.title} — ${data.screenshots.length} screenshots added`);
        updated++;
      } else {
        console.log(`✗ ${data.title} — not found in database`);
        notFound.push(data.title);
      }
    }

    console.log(`\nUpdated ${updated}/${gameImages.length} games`);
    if (notFound.length > 0) {
      console.log(`Not found: ${notFound.join(", ")}`);
    }
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

addScreenshots();
