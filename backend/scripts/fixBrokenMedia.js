import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const GAME_MEDIA = {
  Minecraft: {
    poster: "https://cdn.akamai.steamstatic.com/steam/apps/1672970/library_hero.jpg",
    steamAppId: 1672970,
    screenshots: [
      "https://cdn.akamai.steamstatic.com/steam/apps/1672970/library_hero.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_46ee31494b5d144d5ef6670cb5a1564abbc26fab.1920x1080.jpg?t=1717003107",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_73b488e696e3ae45f5d0a5750de524c231dab8a2.1920x1080.jpg?t=1717003107",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_9cb3efba6636610ec78eddd550147ed5ee7be3a0.1920x1080.jpg?t=1717003107",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1672970/ss_52883e4263c8f8bca14236118ab62c0f70f2c8d0.1920x1080.jpg?t=1717003107",
      "https://cdn.akamai.steamstatic.com/steam/apps/1672970/header.jpg",
    ],
  },
  Fortnite: {
    poster:
      "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg",
    screenshots: [
      "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg",
      "https://fortnite-api.com/images/map_en.png",
      "https://fortnite-api.com/images/map.png",
      "https://cdn2.unrealengine.com/14br-consoles-1920x1080-wlogo-1920x1080-432974386.jpg",
      "https://fortnite-api.com/images/map_en.png",
      "https://fortnite-api.com/images/map.png",
    ],
  },
  "League of Legends": {
    poster:
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/MissFortune_0.jpg",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/c/ca/League_of_Legends_Screenshot_2018.png",
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg",
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg",
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg",
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ezreal_0.jpg",
    ],
  },
  "World of Warcraft": {
    poster:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/header.jpg?t=1782870674",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_a70cbc9141d47a6e97f03da381a05bda44ceb847.1920x1080.jpg?t=1782870674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_2899439a93eb6a2997d79c9cc90ff4a647d0cd43.1920x1080.jpg?t=1782870674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_d9c35de6f0fcce01750553bbdeb5e2957ffa2f4a.1920x1080.jpg?t=1782870674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_7773904df857e65cc557a72d2026bafd5d1e1095.1920x1080.jpg?t=1782870674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_79bd130929eb3d0ca61c6fa54a8d42340142bca1.1920x1080.jpg?t=1782870674",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_6352fee02a5abef9ef9eca5dddc68a7a67be86c9.1920x1080.jpg?t=1782870674",
    ],
  },
  "Call of Duty: Modern Warfare III": {
    poster:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/7d0f21912a075c33bbb5ea558100e187ceb234ac/header.jpg?t=1778886604",
    steamAppId: 2519060,
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/8694e5cb8262343c867d8f8edb70526b19b49cf8/ss_8694e5cb8262343c867d8f8edb70526b19b49cf8.1920x1080.jpg?t=1778886604",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/757e49ee3ff2b6ebf60e479731d983cec47faa41/ss_757e49ee3ff2b6ebf60e479731d983cec47faa41.1920x1080.jpg?t=1778886604",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/f713211188a2a872d638089b2d959a337639e91a/ss_f713211188a2a872d638089b2d959a337639e91a.1920x1080.jpg?t=1778886604",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/ee37e2686b1a21ede5b74e853d046ba9bd087878/ss_ee37e2686b1a21ede5b74e853d046ba9bd087878.1920x1080.jpg?t=1778886604",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/e23921966033db7075d68e33e233120756357093/ss_e23921966033db7075d68e33e233120756357093.1920x1080.jpg?t=1778886604",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/f778362cc479898f1f54f5e4de4f88130cf2b140/ss_f778362cc479898f1f54f5e4de4f88130cf2b140.1920x1080.jpg?t=1778886604",
    ],
  },
  Valorant: {
    poster:
      "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/stylizedbackgroundimage.png",
    screenshots: [
      "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
      "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
      "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
      "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
      "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
      "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/premierbackgroundimage.png",
    ],
  },
  Bloodborne: {
    poster:
      "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bloodborne_Cover_Wallpaper.jpg/1920px-Bloodborne_Cover_Wallpaper.jpg",
    screenshots: [
      "https://upload.wikimedia.org/wikipedia/en/3/36/Bloodborne_Alpha_PlayStation_4_gameplay_screenshot.png",
      "https://images7.alphacoders.com/130/thumb-1920-1305260.jpeg",
      "https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg",
      "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bloodborne_Cover_Wallpaper.jpg/1920px-Bloodborne_Cover_Wallpaper.jpg",
      "https://upload.wikimedia.org/wikipedia/en/3/36/Bloodborne_Alpha_PlayStation_4_gameplay_screenshot.png",
      "https://images7.alphacoders.com/130/thumb-1920-1305260.jpeg",
    ],
  },
};

async function fixBrokenMedia() {
  await connectDB();

  let updated = 0;

  for (const [title, media] of Object.entries(GAME_MEDIA)) {
    const update = {
      poster: media.poster,
      backdrop: media.poster,
      screenshots: media.screenshots,
    };
    if (media.steamAppId) update.steamAppId = media.steamAppId;

    const result = await Game.updateOne({ title, isActive: true }, { $set: update });

    if (result.matchedCount === 0) {
      console.log(`NOT FOUND: ${title}`);
    } else {
      updated += 1;
      console.log(`FIXED: ${title}`);
      console.log(`  poster: ${media.poster}`);
      console.log(`  screenshots: ${media.screenshots.length}`);
    }
  }

  console.log(`\nDone — fixed ${updated}/${Object.keys(GAME_MEDIA).length} games`);
  await mongoose.disconnect();
}

fixBrokenMedia().catch((err) => {
  console.error(err);
  process.exit(1);
});