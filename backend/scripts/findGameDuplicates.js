import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

// ─── findDuplicates ───────────────────────────────────────
export async function findDuplicates() {
  await connectDB();
  const games = await Game.find({ isActive: true }).select("title _id showOnHomepage trending homepagePosition trendingPosition").lean();
  const spider = games.filter((g) => /spider/i.test(g.title));
  console.log("Spider-Man games:\n", JSON.stringify(spider, null, 2));

  const byTitle = {};
  for (const g of games) {
    const key = g.title.trim().toLowerCase();
    if (!byTitle[key]) byTitle[key] = [];
    byTitle[key].push(g);
  }
  const dupes = Object.entries(byTitle).filter(([, list]) => list.length > 1);
  console.log(`\nExact title duplicates: ${dupes.length}`);
  dupes.forEach(([title, list]) => {
    console.log(`\n${title}:`);
    list.forEach((g) => console.log(`  ${g._id} homepage=${g.showOnHomepage} trending=${g.trending}`));
  });
  await mongoose.disconnect();
}

// ─── auditSpiderDuplicates ────────────────────────────────
export async function auditSpiderDuplicates() {
  await connectDB();
  const games = await Game.find({ $or: [{ title: /spider/i }, { title: /marvel/i }] }).lean();
  console.log(`Found ${games.length} Spider-Man / Marvel related games\n`);
  for (const g of games) {
    console.log(`${g.title}`);
    console.log(`  _id: ${g._id}`);
    console.log(`  isActive: ${g.isActive}`);
    console.log(`  showOnHomepage: ${g.showOnHomepage} (pos: ${g.homepagePosition})`);
    console.log(`  trending: ${g.trending} (pos: ${g.trendingPosition})`);
    console.log(`  poster: ${(g.poster||"").substring(0,80)}`);
    console.log();
  }

  const byTitle = {};
  for (const g of games) {
    const key = g.title.trim().toLowerCase();
    if (!byTitle[key]) byTitle[key] = [];
    byTitle[key].push(g);
  }
  const dupes = Object.entries(byTitle).filter(([, list]) => list.length > 1);
  if (dupes.length > 0) {
    console.log("--- DUPLICATES FOUND ---");
    dupes.forEach(([title, list]) => {
      console.log(`\n${title} (${list.length} copies):`);
      list.forEach((g) => console.log(`  ${g._id} active=${g.isActive} homepage=${g.showOnHomepage} trending=${g.trending}`));
    });
  } else {
    console.log("No duplicate Spider-Man titles found.");
  }
  await mongoose.disconnect();
}

// ─── findSpiderGames ──────────────────────────────────────
export async function findSpiderGames() {
  await connectDB();
  const games = await Game.find({ isActive: true }).select("title _id showOnHomepage homepagePosition trending trendingPosition").lean();
  const spider = games.filter((g) => /spider/i.test(g.title));
  console.log("Spider-Man related games:", spider.length);
  spider.forEach((g) => console.log(`  ${g.title} (${g._id}) homepage=${g.showOnHomepage}/${g.homepagePosition} trending=${g.trending}/${g.trendingPosition}`));
  await mongoose.disconnect();
}

// ─── findSpiderPages ──────────────────────────────────────
export async function findSpiderPages() {
  const { default: fetch } = await import("node-fetch");
  const base = process.env.VITE_API_URL || "http://localhost:3000";
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${base}/api/games?page=${page}&limit=10`);
    const data = await res.json();
    const found = (data.games || []).filter((g) => /spider/i.test(g.title));
    if (found.length) found.forEach((g) => console.log(`Page ${page}: ${g.title} (${g._id})`));
    else console.log(`Page ${page}: no Spider-Man games`);
  }
}

// ─── simulatePaginationDupes ──────────────────────────────
export async function simulatePaginationDupes() {
  const { default: fetch } = await import("node-fetch");
  const base = process.env.VITE_API_URL || "http://localhost:3000";
  const seen = new Set();
  const dupes = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${base}/api/games?page=${page}&limit=10`);
    const data = await res.json();
    const games = data.games || [];
    if (games.length === 0) break;
    for (const g of games) {
      const key = g.title + "|" + (g._id || g.id);
      if (seen.has(key)) dupes.push({ title: g.title, page, id: g._id || g.id });
      seen.add(key);
    }
  }
  if (dupes.length) { console.log("Duplicates across pages:"); dupes.forEach((d) => console.log(`  ${d.title} (${d.id}) on page ${d.page}`)); }
  else console.log("No duplicate games across pages");
}

// ─── CLI dispatch ─────────────────────────────────────────
const tasks = { findDuplicates, auditSpiderDuplicates, findSpiderGames, findSpiderPages, simulatePaginationDupes };
const task = process.argv[2];
if (tasks[task]) tasks[task]().catch((e) => { console.error(e); process.exit(1); });
else console.log(`Usage: node findGameDuplicates.js <${Object.keys(tasks).join("|")}>`);
