import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const imageData = [
  {
    title: "Elden Ring",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_9a8b9c0a5e1a3f8c5e7e1c9f0b3d6a8e7f0c1d2e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_5e8f7c9a0b1d2e3f4a5c6b7d8e9f0a1b2c3d4e5f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg",
    ]
  },
  {
    title: "The Legend of Zelda: Breath of the Wild",
    backdrop: "https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc8bki.jpg",
    screenshots: [
      "https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc8bkf.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc8bkk.jpg",
      "https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc8bkp.jpg",
    ]
  },
  {
    title: "Cyberpunk 2077",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d.jpg",
    ]
  },
  {
    title: "God of War Ragnarök",
    backdrop: "https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png",
    screenshots: [
      "https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3bi888QTLZYdl7Oi0s.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202209/1409/GhEBug3TjnKC2hJPTY5KjH3W.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202209/1406/6iY7YpGfpFoG0kBY9eGqG0kF.png",
    ]
  },
  {
    title: "Baldur's Gate 3",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d.jpg",
    ]
  },
  {
    title: "Hogwarts Legacy",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/ss_4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/ss_5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/ss_6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a.jpg",
    ]
  },
  {
    title: "The Witcher 3: Wild Hunt",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d.jpg",
    ]
  },
  {
    title: "Red Dead Redemption 2",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a.jpg",
    ]
  },
  {
    title: "Ghost of Tsushima",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2215430/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2215430/ss_3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2215430/ss_4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2215430/ss_5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d.jpg",
    ]
  },
  {
    title: "Final Fantasy XVI",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2515020/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2515020/ss_6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2515020/ss_7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2515020/ss_8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a.jpg",
    ]
  },
  {
    title: "Starfield",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/ss_9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/ss_0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/ss_1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d.jpg",
    ]
  },
  {
    title: "Palworld",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a.jpg",
    ]
  },
  {
    title: "Dragon's Dogma 2",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2054970/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2054970/ss_5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2054970/ss_6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2054970/ss_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.jpg",
    ]
  },
  {
    title: "Helldivers 2",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/ss_8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/ss_9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/553850/ss_0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a.jpg",
    ]
  },
  {
    title: "Tekken 8",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1778820/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1778820/ss_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1778820/ss_2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1778820/ss_3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d.jpg",
    ]
  },
  {
    title: "Final Fantasy VII Remake",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1462040/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1462040/ss_4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1462040/ss_5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1462040/ss_6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a.jpg",
    ]
  },
  {
    title: "Dark Souls III",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/374320/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/374320/ss_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/374320/ss_8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/374320/ss_9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d.jpg",
    ]
  },
  {
    title: "Bloodborne",
    backdrop: "https://image.api.playstation.com/vulcan/ap/rnd/202307/2712/92e1e4f1-2e5a-4c9d-9b7a-0c8a2e1f4b6a.png",
    screenshots: [
      "https://image.api.playstation.com/vulcan/ap/rnd/202307/2712/92e1e4f1-2e5a-4c9d-9b7a-0c8a2e1f4b6a.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202307/2712/9e8d7c6b-5a4f-3e2d-1c0b-9a8f7e6d5c4b.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202307/2712/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d.png",
    ]
  },
  {
    title: "Monster Hunter: World",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582160/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582160/ss_0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582160/ss_1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/582160/ss_2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a.jpg",
    ]
  },
  {
    title: "Metal Gear Solid V: The Phantom Pain",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/287700/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/287700/ss_3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/287700/ss_4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/287700/ss_5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d.jpg",
    ]
  },
  {
    title: "Death Stranding",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/ss_6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/ss_7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1850570/ss_8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a.jpg",
    ]
  },
  {
    title: "Persona 5",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1687950/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1687950/ss_9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1687950/ss_0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1687950/ss_1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d.jpg",
    ]
  },
  {
    title: "Devil May Cry 5",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/601150/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/601150/ss_2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/601150/ss_3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/601150/ss_4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a.jpg",
    ]
  },
  {
    title: "Resident Evil 4 Remake",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/ss_5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/ss_6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2050650/ss_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.jpg",
    ]
  },
  {
    title: "Street Fighter 6",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1364780/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1364780/ss_8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1364780/ss_9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1364780/ss_0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a.jpg",
    ]
  },
  {
    title: "Mortal Kombat 1",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1971870/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1971870/ss_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1971870/ss_2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1971870/ss_3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d.jpg",
    ]
  },
  {
    title: "Alan Wake 2",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2477940/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2477940/ss_4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2477940/ss_5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2477940/ss_6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a.jpg",
    ]
  },
  {
    title: "Star Wars Jedi: Survivor",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1774580/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1774580/ss_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1774580/ss_8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1774580/ss_9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d.jpg",
    ]
  },
  {
    title: "Minecraft",
    backdrop: "https://image.api.playstation.com/vulcan/ap/rnd/202307/3110/1c9e6b5f4a3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c.png",
    screenshots: [
      "https://image.api.playstation.com/vulcan/ap/rnd/202307/3110/1c9e6b5f4a3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202307/3110/a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202307/3110/3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a.png",
    ]
  },
  {
    title: "Fortnite",
    backdrop: "https://cdn2.unrealengine.com/fortnite-battle-royale-25-00-hero-3840x2160-7a9e8f5a6b7c.jpg",
    screenshots: [
      "https://cdn2.unrealengine.com/fortnite-battle-royale-25-00-hero-3840x2160-7a9e8f5a6b7c.jpg",
      "https://cdn2.unrealengine.com/fortnite-chapter-5-season-1-hero-3840x2160-8b0f1a2b3c4d.jpg",
      "https://cdn2.unrealengine.com/fortnite-chapter-5-season-2-hero-3840x2160-9c1d2e3f4a5b.jpg",
    ]
  },
  {
    title: "Call of Duty: Modern Warfare III",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/ss_0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/ss_1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3595270/ss_2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a.jpg",
    ]
  },
  {
    title: "Grand Theft Auto V",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/ss_3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/ss_4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/ss_5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d.jpg",
    ]
  },
  {
    title: "League of Legends",
    backdrop: "https://images.contentstack.io/v3/assets/blt73170b6d7c6f5b8d/blt4e5f6a7b8c9d0e1f/league-of-legends-worlds-2023.jpg",
    screenshots: [
      "https://images.contentstack.io/v3/assets/blt73170b6d7c6f5b8d/blt4e5f6a7b8c9d0e1f/league-of-legends-worlds-2023.jpg",
      "https://images.contentstack.io/v3/assets/blt73170b6d7c6f5b8d/blt5f6a7b8c9d0e1f2a/league-of-legends-gameplay-1.jpg",
      "https://images.contentstack.io/v3/assets/blt73170b6d7c6f5b8d/blt6a7b8c9d0e1f2a3b/league-of-legends-gameplay-2.jpg",
    ]
  },
  {
    title: "Dota 2",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/ss_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/ss_8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/570/ss_9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d.jpg",
    ]
  },
  {
    title: "Counter-Strike 2",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/ss_0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/ss_1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/ss_2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a.jpg",
    ]
  },
  {
    title: "Valorant",
    backdrop: "https://images.contentstack.io/v3/assets/bltb6530b5f8b4a7c8d/blt9e0f1a2b3c4d5e6f/valorant-episode-8-key-art.jpg",
    screenshots: [
      "https://images.contentstack.io/v3/assets/bltb6530b5f8b4a7c8d/blt9e0f1a2b3c4d5e6f/valorant-episode-8-key-art.jpg",
      "https://images.contentstack.io/v3/assets/bltb6530b5f8b4a7c8d/blt0a1b2c3d4e5f6a7b/valorant-gameplay-1.jpg",
      "https://images.contentstack.io/v3/assets/bltb6530b5f8b4a7c8d/blt1b2c3d4e5f6a7b8c/valorant-gameplay-2.jpg",
    ]
  },
  {
    title: "Overwatch 2",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2357570/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2357570/ss_3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2357570/ss_4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2357570/ss_5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d.jpg",
    ]
  },
  {
    title: "Apex Legends",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/ss_6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/ss_7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/ss_8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a.jpg",
    ]
  },
  {
    title: "Warframe",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/230410/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/230410/ss_9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/230410/ss_0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/230410/ss_1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d.jpg",
    ]
  },
  {
    title: "Path of Exile",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/238960/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/238960/ss_2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/238960/ss_3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/238960/ss_4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a.jpg",
    ]
  },
  {
    title: "Lost Ark",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599340/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599340/ss_5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599340/ss_6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599340/ss_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.jpg",
    ]
  },
  {
    title: "New World",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1063730/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1063730/ss_8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1063730/ss_9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1063730/ss_0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a.jpg",
    ]
  },
  {
    title: "Final Fantasy XIV",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/39210/ss_3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d.jpg",
    ]
  },
  {
    title: "World of Warcraft",
    backdrop: "https://images.blz-contentstack.com/v3/assets/blt1234567890abcdef/blt4e5f6a7b8c9d0e1f/world-of-warcraft-dragonflight-key-art.jpg",
    screenshots: [
      "https://images.blz-contentstack.com/v3/assets/blt1234567890abcdef/blt4e5f6a7b8c9d0e1f/world-of-warcraft-dragonflight-key-art.jpg",
      "https://images.blz-contentstack.com/v3/assets/blt1234567890abcdef/blt5f6a7b8c9d0e1f2a/world-of-warcraft-gameplay-1.jpg",
      "https://images.blz-contentstack.com/v3/assets/blt1234567890abcdef/blt6a7b8c9d0e1f2a3b/world-of-warcraft-gameplay-2.jpg",
    ]
  },
  {
    title: "Halo Infinite",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1240440/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1240440/ss_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1240440/ss_8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1240440/ss_9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d.jpg",
    ]
  },
  {
    title: "Assassin's Creed: Mirage",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2840340/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2840340/ss_0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2840340/ss_1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2840340/ss_2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a.jpg",
    ]
  },
  {
    title: "Spider-Man 2",
    backdrop: "https://image.api.playstation.com/vulcan/ap/rnd/202307/2802/5e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f.png",
    screenshots: [
      "https://image.api.playstation.com/vulcan/ap/rnd/202307/2802/5e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202307/2802/a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202307/2802/7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e.png",
    ]
  },
  {
    title: "NBA 2K24",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2338770/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2338770/ss_3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2338770/ss_4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2338770/ss_5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d.jpg",
    ]
  },
  {
    title: "FC 24",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2195250/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2195250/ss_6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2195250/ss_7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2195250/ss_8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a.jpg",
    ]
  },
  {
    title: "Gran Turismo 7",
    backdrop: "https://image.api.playstation.com/vulcan/ap/rnd/202209/1406/6iY7YpGfpFoG0kBY9eGqG0kF.png",
    screenshots: [
      "https://image.api.playstation.com/vulcan/ap/rnd/202209/1406/6iY7YpGfpFoG0kBY9eGqG0kF.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202209/1406/9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202209/1406/0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c.png",
    ]
  },
  {
    title: "Forza Motorsport",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2440510/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2440510/ss_9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2440510/ss_0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2440510/ss_1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d.jpg",
    ]
  },
  {
    title: "Ghost of Yotei",
    backdrop: "https://image.api.playstation.com/vulcan/ap/rnd/202409/2416/9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d.png",
    screenshots: [
      "https://image.api.playstation.com/vulcan/ap/rnd/202409/2416/9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202409/2416/a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202409/2416/1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e.png",
    ]
  },
  {
    title: "Grand Theft Auto VI",
    backdrop: "https://image.api.playstation.com/vulcan/ap/rnd/202312/0512/9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d.png",
    screenshots: [
      "https://image.api.playstation.com/vulcan/ap/rnd/202312/0512/9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202312/0512/a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d.png",
      "https://image.api.playstation.com/vulcan/ap/rnd/202312/0512/1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e.png",
    ]
  },
  {
    title: "Resident Evil 2 Remake",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/ss_2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/ss_3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/883710/ss_4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a.jpg",
    ]
  },
  {
    title: "Resident Evil 7: Biohazard",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418370/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418370/ss_5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418370/ss_6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/418370/ss_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d.jpg",
    ]
  },
  {
    title: "Resident Evil Village",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a.jpg",
    ]
  },
  {
    title: "Resident Evil 3 Remake",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/952000/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/952000/ss_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/952000/ss_2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/952000/ss_3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d.jpg",
    ]
  },
  {
    title: "Resident Evil 5",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/21690/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/21690/ss_4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/21690/ss_5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/21690/ss_6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a.jpg",
    ]
  },
  {
    title: "Resident Evil 0",
    backdrop: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/339340/hero_capsule.jpg",
    screenshots: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/339340/ss_7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/339340/ss_8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c.jpg",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/339340/ss_9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d.jpg",
    ]
  },
];

async function updateImages() {
  await connectDB();

  let updated = 0;
  for (const data of imageData) {
    const updateFields = {};
    if (data.backdrop) updateFields.backdrop = data.backdrop;
    if (data.screenshots) updateFields.screenshots = data.screenshots;

    const result = await Game.findOneAndUpdate(
      { title: data.title },
      { $set: updateFields },
      { new: true }
    );

    if (result) {
      console.log(`✅ ${data.title}: backdrop + ${data.screenshots?.length || 0} screenshots`);
      updated++;
    } else {
      console.log(`❌ NOT FOUND: ${data.title}`);
    }
  }

  console.log(`\nDone! Updated ${updated} games with images.`);
  process.exit(0);
}

updateImages();
