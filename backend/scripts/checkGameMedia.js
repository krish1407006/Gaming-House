import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

// ─── checkCurrent ─────────────────────────────────────────
export async function checkCurrent() {
  await connectDB();
  const games = await Game.find({ isActive: true }).lean();
  for (const g of games) {
    const isSteam = g.poster && g.poster.includes("steamstatic");
    const isWiki = g.poster && g.poster.includes("wikimedia");
    const type = isSteam ? "STEAM" : isWiki ? "WIKI" : "OTHER";
    const isLandscape = g.poster && (g.poster.includes("hero") || g.poster.includes("header"));
    console.log(`${type}${isLandscape ? " LANDSCAPE" : " PORTRAIT"}: ${g.title}`);
  }
  await mongoose.disconnect();
}

// ─── checkMissing ─────────────────────────────────────────
export async function checkMissing() {
  await connectDB();
  const games = await Game.find({ isActive: true }).sort("title").lean();
  const missing = [];
  for (const g of games) {
    const noPoster = !g.poster || g.poster.trim() === "";
    const noBackdrop = !g.backdrop || g.backdrop.trim() === "";
    const noScreenshots = !g.screenshots || g.screenshots.length === 0;
    const badPoster = g.poster && (g.poster.includes("NONE") || g.poster.endsWith(".svg") || g.poster.includes("placeholder"));
    if (noPoster || noBackdrop || noScreenshots || badPoster) {
      missing.push({ title: g.title, poster: g.poster || "NONE", backdrop: g.backdrop || "NONE", screenshots: g.screenshots?.length || 0, steamAppId: g.steamAppId || null });
    }
  }
  console.log(`Games with missing/bad media: ${missing.length}\n`);
  missing.forEach((g) => { console.log(`${g.title}\n  poster: ${(g.poster||"").substring(0,120)}\n  backdrop: ${(g.backdrop||"").substring(0,80)}\n  screenshots: ${g.screenshots}\n  steamAppId: ${g.steamAppId}\n`); });
  await mongoose.disconnect();
}

// ─── checkPosters ─────────────────────────────────────────
export async function checkPosters() {
  await connectDB();
  const games = await Game.find({ isActive: true }).lean();
  games.forEach((g) => console.log(`${g.title}: ${(g.poster||"NONE")}`));
  await mongoose.disconnect();
}

// ─── dumpMedia ────────────────────────────────────────────
export async function dumpMedia() {
  await connectDB();
  const filter = process.argv[3] ? { title: { $regex: process.argv[3], $options: "i" } } : {};
  const games = await Game.find({ isActive: true, ...filter }).lean();
  games.forEach((g) => {
    console.log(`\n=== ${g.title} ===`);
    console.log(`poster: ${g.poster}`);
    console.log(`backdrop: ${g.backdrop}`);
    console.log(`screenshots: ${JSON.stringify(g.screenshots || [], null, 2)}`);
  });
  await mongoose.disconnect();
}

// ─── findBroken ───────────────────────────────────────────
export async function findBroken() {
  async function checkUrl(url) {
    if (!url) return false;
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      const type = res.headers.get("content-type") || "";
      return res.ok && type.startsWith("image");
    } catch { return false; }
  }
  await connectDB();
  const games = await Game.find({ isActive: true }).lean();
  let broken = 0;
  for (const g of games) {
    const ok = await checkUrl(g.poster);
    if (!ok) { console.log(`BROKEN: ${g.title} -> ${g.poster}`); broken++; }
  }
  console.log(`\nTotal broken: ${broken}/${games.length}`);
  await mongoose.disconnect();
}

// ─── validateUrls ─────────────────────────────────────────
export async function validateUrls() {
  async function checkUrl(url) {
    if (!url) return { ok: false, status: "empty" };
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      const type = res.headers.get("content-type") || "";
      return { ok: res.ok && type.startsWith("image"), status: res.status, type };
    } catch (err) { return { ok: false, status: err.message }; }
  }

  const focus = process.argv[3] ? process.argv[3].split(",") : [];
  await connectDB();
  const query = focus.length ? { isActive: true, title: { $in: focus } } : { isActive: true };
  const games = await Game.find(query).sort("title").lean();

  for (const g of games) {
    const poster = await checkUrl(g.poster);
    const backdrop = await checkUrl(g.backdrop);
    const screenshots = await Promise.all((g.screenshots || []).map((u) => checkUrl(u)));
    const badSs = screenshots.filter((r) => !r.ok).length;
    console.log(`${g.title}\n  poster: ${poster.ok?"OK":"BROKEN"} (${poster.status})\n  backdrop: ${backdrop.ok?"OK":"BROKEN"} (${backdrop.status})\n  screenshots: ${(g.screenshots||[]).length} total, ${badSs} broken\n`);
  }
  await mongoose.disconnect();
}

// ─── listAllTitles ────────────────────────────────────────
export async function listAllTitles() {
  await connectDB();
  const games = await Game.find({}).select("title _id isActive showOnHomepage trending").sort("title").lean();
  const byName = {};
  for (const g of games) {
    const key = g.title.trim().toLowerCase();
    if (!byName[key]) byName[key] = [];
    byName[key].push(g);
  }
  console.log(`Total games: ${games.length}`);
  console.log(`Unique titles: ${Object.keys(byName).length}`);
  for (const [title, list] of Object.entries(byName).sort()) {
    if (list.length > 1) console.log(`DUP: ${list[0].title} (${list.length}x)`);
    else console.log(`    ${list[0].title}${list[0].showOnHomepage?" [homepage]":""}${list[0].trending?" [trending]":""}`);
  }
  await mongoose.disconnect();
}

// ─── CLI dispatch ─────────────────────────────────────────
const tasks = { checkCurrent, checkMissing, checkPosters, dumpMedia, findBroken, validateUrls, listAllTitles };
const task = process.argv[2];
if (tasks[task]) tasks[task]().catch((e) => { console.error(e); process.exit(1); });
else console.log(`Usage: node checkGameMedia.js <${Object.keys(tasks).join("|")}>`);
