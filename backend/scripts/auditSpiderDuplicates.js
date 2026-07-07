import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function auditSpiderDuplicates() {
  await connectDB();

  const all = await Game.find({}).select("title _id isActive poster trending showOnHomepage").lean();
  const spiderish = all.filter(
    (g) =>
      /spider/i.test(g.title) ||
      g.poster?.includes("2651280") ||
      /spider-man/i.test(g.title)
  );

  console.log("=== DB: spider-ish games (including inactive) ===");
  spiderish.forEach((g) => {
    console.log(`${g.isActive ? "ACTIVE" : "INACTIVE"} | ${g.title} | ${g._id}`);
    console.log(`  poster: ${g.poster}`);
  });

  const poster265 = all.filter((g) => g.isActive && g.poster?.includes("2651280"));
  console.log(`\n=== Active games with Spider-Man 2 Steam poster (2651280): ${poster265.length} ===`);
  poster265.forEach((g) => console.log(`- ${g.title} (${g._id})`));

  const trending = await Game.find({ isActive: true, trending: true })
    .select("title _id poster trendingPosition")
    .sort({ trendingPosition: 1 })
    .lean();
  const trendingSpider = trending.filter(
    (g) => /spider/i.test(g.title) || g.poster?.includes("2651280")
  );
  console.log(`\n=== Trending spider-ish: ${trendingSpider.length} ===`);
  trendingSpider.forEach((g) => console.log(`- pos ${g.trendingPosition}: ${g.title}`));

  const homepage = await Game.find({ isActive: true, showOnHomepage: true })
    .select("title _id poster homepagePosition")
    .sort({ homepagePosition: 1 })
    .lean();
  const homeSpider = homepage.filter(
    (g) => /spider/i.test(g.title) || g.poster?.includes("2651280")
  );
  console.log(`\n=== Homepage spider-ish: ${homeSpider.length} ===`);
  homeSpider.forEach((g) => console.log(`- pos ${g.homepagePosition}: ${g.title}`));

  for (const file of ["homepage.json", "trending.json"]) {
    const p = path.resolve(__dirname, `../../frontend/public/data/${file}`);
    if (!fs.existsSync(p)) continue;
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    const games = data.games || [];
    const hits = games.filter(
      (g) => /spider/i.test(g.title) || g.poster?.includes("2651280")
    );
    console.log(`\n=== ${file} spider-ish: ${hits.length} ===`);
    hits.forEach((g) => console.log(`- ${g.title} | ${g.poster?.slice(0, 70)}`));
  }

  try {
    const res = await fetch("https://gaming-house.onrender.com/api/games/trending?limit=50");
    const json = await res.json();
    const games = json?.games || json?.data?.games || [];
    const hits = games.filter(
      (g) => /spider/i.test(g.title) || g.poster?.includes("2651280")
    );
    console.log(`\n=== Live API trending spider-ish: ${hits.length} ===`);
    hits.forEach((g) => console.log(`- ${g.title} | ${g.poster?.slice(0, 70)}`));

    const ids = games.map((g) => String(g._id));
    const dupeIds = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupeIds.length) console.log("DUPLICATE IDS in trending API:", dupeIds);
  } catch (e) {
    console.log("Live API check failed:", e.message);
  }

  await mongoose.disconnect();
}

auditSpiderDuplicates();