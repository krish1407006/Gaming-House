import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const reGames = [
  {
    title: "Resident Evil 2 Remake",
    description: "The survival horror classic returns with a stunning remake. Play as Leon Kennedy and Claire Redfield in Raccoon City as a deadly virus transforms the population into ravenous zombies. Explore the iconic police station, solve intricate puzzles, and face the relentless Tyrant in this masterful reimagining. With over-the-shoulder camera, updated controls, and breathtaking visuals, this remake sets a new standard for horror games.",
    director: "Kazunori Kadoi",
    cast: ["Capcom"],
    genre: ["Horror", "Action", "Thriller"],
    releaseDate: new Date("2019-01-25"),
    duration: 12,
    language: "English",
    country: "Japan",
    poster: "https://cdn.akamai.steamstatic.com/steam/apps/883710/header.jpg",
    featured: false,
    isActive: true,
    addedBy: "system",
  },
  {
    title: "Resident Evil 3 Remake",
    description: "Escape the nightmare of Raccoon City as Jill Valentine in this high-octane remake of the 1999 classic. Hunted ceaselessly by the intelligent bioweapon Nemesis, fight through infected streets and find a way out before the city is destroyed. Intense action, dodge mechanics, and branching choices create a more dynamic survival horror experience. A shorter, punchier companion to RE2 Remake.",
    director: "Kiyohiko Sakata",
    cast: ["Capcom"],
    genre: ["Horror", "Action", "Thriller"],
    releaseDate: new Date("2020-04-03"),
    duration: 10,
    language: "English",
    country: "Japan",
    poster: "https://cdn.akamai.steamstatic.com/steam/apps/952420/header.jpg",
    featured: false,
    isActive: true,
    addedBy: "system",
  },
  {
    title: "Resident Evil 7: Biohazard",
    description: "A radical return to survival horror roots in first-person perspective. Investigate a derelict plantation in Louisiana in search of your missing wife, only to discover the Baker family has been infected by a terrifying mold-based virus. Claustrophobic corridors, limited resources, and visceral combat create an intensely personal horror experience. The game that reinvented the franchise for a new generation.",
    director: "Koshi Nakanishi",
    cast: ["Capcom"],
    genre: ["Horror", "Action", "Thriller"],
    releaseDate: new Date("2017-01-24"),
    duration: 14,
    language: "English",
    country: "Japan",
    poster: "https://cdn.akamai.steamstatic.com/steam/apps/418370/header.jpg",
    featured: false,
    isActive: true,
    addedBy: "system",
  },
  {
    title: "Resident Evil Village",
    description: "Ethan Winters returns in a chilling first-person survival horror set in a snowbound European village. Search for your kidnapped daughter while facing four lycanthropic lords, each ruling a distinct realm of horror. From Lady Dimitrescu's gothic castle to a factory of nightmares, RE Village blends action and horror seamlessly. The direct sequel to RE7 that expands the lore while delivering relentless terror.",
    director: "Morimasa Sato",
    cast: ["Capcom"],
    genre: ["Horror", "Action", "Fantasy"],
    releaseDate: new Date("2021-05-07"),
    duration: 16,
    language: "English",
    country: "Japan",
    poster: "https://cdn.akamai.steamstatic.com/steam/apps/1196590/header.jpg",
    featured: false,
    isActive: true,
    addedBy: "system",
  },
  {
    title: "Resident Evil 5",
    description: "Partner up with Sheva Alomar as Chris Redfield investigates a bioterrorism threat in Kijuju, Africa. This action-heavy entry introduces co-op gameplay, allowing two players to work together through hordes of infected Majini. With inventory management, weapon upgrades, and over-the-top set pieces, RE5 delivers blockbuster action while retaining series staples. The best-selling Resident Evil game of all time.",
    director: "Jun Takeuchi",
    cast: ["Capcom"],
    genre: ["Horror", "Action", "Thriller"],
    releaseDate: new Date("2009-03-05"),
    duration: 18,
    language: "English",
    country: "Japan",
    poster: "https://cdn.akamai.steamstatic.com/steam/apps/21690/header.jpg",
    featured: false,
    isActive: true,
    addedBy: "system",
  },
  {
    title: "Resident Evil 0",
    description: "The prequel to the original Resident Evil stars Rebecca Chambers and convicted murderer Billy Coen. Escape a derailed train overrun by leeches and zombies, then explore a secret Umbrella facility in the Arklay Mountains. Unique partner-switching mechanics allow for cooperative puzzle solving and strategic combat. Essential lore for fans featuring the origins of the T-Virus outbreak.",
    director: "Koji Oda",
    cast: ["Capcom"],
    genre: ["Horror", "Action", "Thriller"],
    releaseDate: new Date("2002-11-12"),
    duration: 10,
    language: "English",
    country: "Japan",
    poster: "https://cdn.akamai.steamstatic.com/steam/apps/339340/header.jpg",
    featured: false,
    isActive: true,
    addedBy: "system",
  },
];

async function main() {
  await connectDB();
  let added = 0;
  for (const game of reGames) {
    const existing = await Game.findOne({ title: game.title });
    if (existing) {
      console.log(`Skipped (exists): ${game.title}`);
      continue;
    }
    await Game.create(game);
    console.log(`Added: ${game.title}`);
    added++;
  }
  console.log(`\nInserted ${added} new Resident Evil games`);
  process.exit(0);
}

main();
