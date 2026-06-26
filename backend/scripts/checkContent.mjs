import mongoose from "mongoose";
import "dotenv/config";

const newTitles = [
  "Grand Theft Auto VI", "Monster Hunter Wilds", "Doom: The Dark Ages",
  "Death Stranding 2: On the Beach", "Assassin's Creed Shadows", "Avowed",
  "Metroid Prime 4: Beyond", "Ghost of Yotei", "Borderlands 4",
  "Sid Meier's Civilization VII", "Split Fiction", "Fable",
  "The First Berserker: Khazan", "Atomfall", "Elden Ring Nightreign",
  "Mafia: The Old Country", "Like a Dragon: Pirate Yakuza in Hawaii",
  "Clair Obscur: Expedition 33", "South of Midnight", "The Witcher IV",
  "Marvel's Wolverine", "Gears of War: E-Day", "Mass Effect 5",
  "Resident Evil 2 Remake", "Resident Evil 3 Remake",
  "Resident Evil 7: Biohazard", "Resident Evil Village",
  "Resident Evil 5", "Resident Evil 0",
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Game = (await import("./models/Game.js")).default;

  for (const t of newTitles) {
    const g = await Game.findOne({ title: t }).lean();
    if (!g) { console.log(`${t}: NOT FOUND`); continue; }
    const descLen = g.description ? g.description.length : 0;
    const sc = g.screenshots ? g.screenshots.length : 0;
    const poster = g.poster ? "yes" : "no";
    console.log(`${t}: desc=${descLen} chars, screenshots=${sc}, poster=${poster}`);
  }

  await mongoose.disconnect();
}

main();
