import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const STEAM_BASE = "https://store.steampowered.com/api";

const hardcodedIds = {
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
  "Grand Theft Auto VI": 271590,
  "Spider-Man": 1817070,
  "Spider-Man: Miles Morales": 1817190,
  "The Legend of Zelda: Breath of the Wild": 0,
  "Super Mario Odyssey": 0,
  "Bloodborne": 0,
  "God of War": 1593500,
  "The Last of Us Part I": 1888930,
  "Uncharted: Legacy of Thieves Collection": 1659420,
  "Horizon Zero Dawn": 1151640,
  "Horizon Forbidden West": 2420110,
  "Days Gone": 1259420,
  "Ratchet & Clank: Rift Apart": 1895880,
  "Returnal": 1649240,
  "Demon's Souls": 0,
  "Ghost of Tsushima DIRECTOR'S CUT": 2215430,
  "Final Fantasy VII Rebirth": 3012450,
  "Stellar Blade": 0,
  "Rise of the Ronin": 0,
  "Black Myth: Wukong": 2358720,
  "Silent Hill 2": 2124490,
  "Marvel Rivals": 2767030,
  "Stalker 2: Heart of Chornobyl": 3323000,
  "Indiana Jones and the Great Circle": 2674940,
  "Star Wars Outlaws": 2944960,
  "Unknown 9: Awakening": 2541480,
  "Sword of the Sea": 2671260,
  "Where Winds Meet": 2347930,
  "Phantom Blade Zero": 2605000,
  "Ever 17": 1579550,
  "Remember Me": 228200,
  "Call of Duty: Black Ops 6": 2936580,
  "Minecraft": 0,
  "Fortnite": 0,
  "League of Legends": 0,
  "Valorant": 0,
  "World of Warcraft": 0,
  "Gran Turismo 7": 0,
  "Roblox": 0,
  "PUBG: Battlegrounds": 578080,
  "Fall Guys": 1097150,
  "Rocket League": 252950,
  "Among Us": 945360,
  "Stardew Valley": 413150,
  "Terraria": 105600,
  "Hades": 1145360,
  "Hades II": 2693760,
  "Hollow Knight": 367520,
  "Celeste": 504230,
  "Cuphead": 268910,
  "Undertale": 391540,
  "Disco Elysium": 632470,
  "Outer Wilds": 753640,
  "Subnautica": 264710,
  "Firewatch": 383870,
  "What Remains of Edith Finch": 501300,
  "Inside": 304430,
  "Limbo": 48000,
  "Braid": 26800,
  "Super Meat Boy": 40800,
  "The Binding of Isaac": 113200,
  "Dark Souls": 211420,
  "Dark Souls II": 236430,
  "Sekiro: Shadows Die Twice": 814380,
  "Bloodborne": 0,
  "Nioh": 485510,
  "Nioh 2": 1325200,
  "Wo Long: Fallen Dynasty": 1448440,
  "Lies of P": 1627720,
  "Sifu": 2138710,
  "Katana Zero": 1501350,
  "Hotline Miami": 219150,
  "Hotline Miami 2": 274170,
  "Dishonored": 205100,
  "Dishonored 2": 403640,
  "Prey": 480490,
  "Bioshock": 7670,
  "Bioshock Infinite": 8870,
  "Half-Life 2": 220,
  "Portal": 400,
  "Portal 2": 620,
  "Left 4 Dead 2": 550,
  "Team Fortress 2": 440,
  "Titanfall 2": 1237970,
  "Doom": 379720,
  "Doom Eternal": 782330,
  "Wolfenstein: The New Order": 201810,
  "Wolfenstein II: The New Colossus": 612880,
  "Far Cry 3": 220240,
  "Far Cry 4": 298110,
  "Far Cry 5": 552520,
  "Far Cry 6": 2369390,
  "Assassin's Creed II": 33230,
  "Assassin's Creed Brotherhood": 48190,
  "Assassin's Creed IV: Black Flag": 242050,
  "Assassin's Creed Origins": 289160,
  "Assassin's Creed Odyssey": 812140,
  "Assassin's Creed Valhalla": 2208920,
  "Watch Dogs": 243470,
  "Watch Dogs 2": 447040,
  "Watch Dogs: Legion": 2239550,
  "Tom Clancy's Rainbow Six Siege": 359550,
  "Tom Clancy's The Division": 365590,
  "Tom Clancy's The Division 2": 2221490,
  "The Crew Motorfest": 2747580,
  "Need for Speed": 1267910,
  "Need for Speed Unbound": 1846380,
  "Mass Effect Legendary Edition": 1328670,
  "Dragon Age: Inquisition": 1222690,
  "Dragon Age: The Veilguard": 1845910,
  "Anthem": 238960,
  "Battlefield 1": 1238840,
  "Battlefield V": 1238810,
  "Battlefield 2042": 1517290,
  "Star Wars Battlefront II": 1237980,
  "Star Wars Squadrons": 1222730,
  "It Takes Two": 1426210,
  "A Way Out": 1248130,
  "Brothers: A Tale of Two Sons": 225260,
  "Detroit: Become Human": 1222140,
  "Heavy Rain": 229480,
  "Beyond: Two Souls": 214550,
  "Until Dawn": 2179550,
  "The Quarry": 1570080,
  "Man of Medan": 939910,
  "Little Hope": 1058860,
  "House of Ashes": 1281870,
  "The Devil in Me": 1266480,
  "Psychonauts 2": 607080,
  "Hi-Fi Rush": 1817230,
  "Sea of Thieves": 1172620,
  "Grounded": 962130,
  "Pentiment": 1337760,
  "Forza Horizon 5": 1551360,
  "Microsoft Flight Simulator": 1250410,
  "Age of Empires IV": 1466860,
  "Gears 5": 1097840,
  "Halo: The Master Chief Collection": 976730,
  "Ori and the Blind Forest": 261550,
  "Ori and the Will of the Wisps": 1057090,
  "Cocoon": 1497140,
  "Planet of Lana": 1622740,
  "Sable": 912030,
  "Chicory: A Colorful Tale": 1124340,
  "Tunic": 553420,
  "Death's Door": 894020,
  "Neon White": 1566750,
  "Signalis": 1488200,
  "Cruelty Squad": 367530,
  "The Last of Us Part II": 0,
  "Marvel's Spider-Man 2": 0,
  "Astro Bot": 0,
  "Xenoblade Chronicles 3": 0,
  "Tears of the Kingdom": 0,
  "Super Mario Wonder": 0,
  "Splatoon 3": 0,
  "Metroid Dread": 0,
  "Bayonetta 3": 0,
  "Fire Emblem Engage": 0,
  "Pikmin 4": 0,
  "Kirby and the Forgotten Land": 0,
  "Animal Well": 2703900,
  "Tchia": 1939910,
  "Pacific Drive": 1457090,
  "Dave the Diver": 1868140,
  "Dredge": 1562430,
  "Vampire Survivors": 1794680,
  "Inscryption": 1092790,
  "Slay the Spire": 646570,
  "Dead Cells": 588650,
  "Risk of Rain 2": 632360,
  "Enter the Gungeon": 311690,
  "Hunt: Showdown": 594650,
  "Payday 2": 218620,
  "Payday 3": 1272080,
  "Deep Rock Galactic": 548430,
  "Factorio": 427520,
  "Satisfactory": 526870,
  "Dyson Sphere Program": 1366540,
  "Cities: Skylines": 255710,
  "Cities: Skylines II": 949230,
  "Planet Coaster": 493340,
  "Planet Zoo": 493090,
  "Two Point Hospital": 535930,
  "Two Point Campus": 1649080,
  "RollerCoaster Tycoon": 285310,
  "Football Manager 2024": 2252570,
  "F1 24": 2598050,
  "EA Sports FC 25": 3218880,
  "Granblue Fantasy: Relink": 2053830,
  "Persona 3 Reload": 2161700,
  "Persona 4 Golden": 1113000,
  "Like a Dragon: Infinite Wealth": 2072450,
  "Like a Dragon: Gaiden": 2255450,
  "Yakuza 0": 638970,
  "Yakuza Kiwami": 834530,
  "Yakuza Kiwami 2": 927380,
  "Yakuza 6": 1388590,
  "Judgment": 2058180,
  "Lost Judgment": 2058190,
  "NieR: Automata": 524220,
  "NieR Replicant": 1113560,
  "Kingdom Hearts HD 1.5+2.5 Remix": 2552430,
  "Kingdom Hearts III": 1672980,
  "Street Fighter 6": 1364780,
  "Guilty Gear Strive": 1384160,
  "Dragon Ball FighterZ": 678950,
  "Mortal Kombat 11": 976310,
  "Mortal Kombat X": 307780,
  "Injustice 2": 627270,
  "Elden Ring": 1245620,
  "Path of Exile 2": 2694490,
  "Diablo II: Resurrected": 15270,
  "Diablo III": 23800,
  "Diablo IV": 1778820,
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchSteamAppId(gameName) {
  try {
    const cleanName = gameName.replace(/[™©®]/g, "").trim();
    const searchRes = await fetch(
      `${STEAM_BASE}/storesearch/?term=${encodeURIComponent(cleanName)}&l=en&cc=US`
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    if (!searchData.total || !searchData.items?.length) return null;
    return searchData.items[0].id;
  } catch {
    return null;
  }
}

async function main() {
  await connectDB();

  const games = await Game.find({}).lean();
  console.log(`Found ${games.length} games in database\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = [];

  for (const game of games) {
    if (game.steamAppId) {
      console.log(`  SKIP ${game.title}: already has steamAppId ${game.steamAppId}`);
      skipped++;
      continue;
    }

    let appId = null;

    // 1. Check hardcoded mapping (exact match)
    if (hardcodedIds[game.title]) {
      appId = hardcodedIds[game.title];
      if (appId === 0) {
        console.log(`  SKIP ${game.title}: marked as non-Steam (console exclusive)`);
        await Game.findByIdAndUpdate(game._id, { $set: { steamAppId: null } });
        skipped++;
        continue;
      }
    }

    // 2. Try Steam search API
    if (!appId) {
      appId = await searchSteamAppId(game.title);
      if (appId) {
        console.log(`  API ${game.title}: found appId ${appId}`);
      }
      await delay(1000);
    }

    if (appId) {
      await Game.findByIdAndUpdate(game._id, { $set: { steamAppId: appId } });
      console.log(`  OK  ${game.title}: steamAppId = ${appId}`);
      updated++;
    } else {
      notFound.push(game.title);
      console.log(`  MISS ${game.title}: no Steam App ID found`);
    }
  }

  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Missing: ${notFound.length}`);
  if (notFound.length > 0) {
    console.log("Games without Steam App ID:");
    notFound.forEach((title) => console.log(`  - ${title}`));
  }

  process.exit(0);
}

main();
