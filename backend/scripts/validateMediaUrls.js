import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

const FOCUS = [
  "Minecraft",
  "Fortnite",
  "League of Legends",
  "Valorant",
  "Apex Legends",
  "World of Warcraft",
  "Call of Duty: Modern Warfare III",
  "Roblox",
  "Counter-Strike 2",
  "Overwatch 2",
];

async function checkUrl(url) {
  if (!url) return { ok: false, status: "empty" };
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const type = res.headers.get("content-type") || "";
    return {
      ok: res.ok && type.startsWith("image"),
      status: res.status,
      type,
    };
  } catch (err) {
    return { ok: false, status: err.message };
  }
}

async function validateMediaUrls() {
  await connectDB();
  const query = FOCUS.length
    ? { isActive: true, title: { $in: FOCUS } }
    : { isActive: true };
  const games = await Game.find(query).sort("title").lean();

  const broken = [];

  for (const g of games) {
    const poster = await checkUrl(g.poster);
    const backdrop = await checkUrl(g.backdrop);
    const screenshotResults = await Promise.all(
      (g.screenshots || []).map((url) => checkUrl(url))
    );
    const badScreenshots = screenshotResults.filter((r) => !r.ok).length;

    const hasIssue = !poster.ok || !backdrop.ok || badScreenshots > 0;

    console.log(`${g.title}`);
    console.log(
      `  poster: ${poster.ok ? "OK" : "BROKEN"} (${poster.status}) ${(g.poster || "").substring(0, 90)}`
    );
    console.log(
      `  backdrop: ${backdrop.ok ? "OK" : "BROKEN"} (${backdrop.status})`
    );
    console.log(
      `  screenshots: ${(g.screenshots || []).length} total, ${badScreenshots} broken`
    );

    if (hasIssue) {
      broken.push({
        title: g.title,
        poster: g.poster,
        backdrop: g.backdrop,
        screenshots: g.screenshots,
        posterOk: poster.ok,
        backdropOk: backdrop.ok,
        badScreenshotCount: badScreenshots,
      });
    }
    console.log("");
  }

  // Also scan all games for broken posters
  const allGames = await Game.find({ isActive: true }).lean();
  let allBrokenPosters = 0;
  for (const g of allGames) {
    const poster = await checkUrl(g.poster);
    if (!poster.ok) {
      allBrokenPosters += 1;
      if (!FOCUS.includes(g.title)) {
        broken.push({
          title: g.title,
          poster: g.poster,
          posterOk: false,
        });
      }
    }
  }

  console.log(`\nTotal games with broken posters: ${allBrokenPosters}`);
  console.log(`Focus games with issues: ${broken.length}`);

  await mongoose.disconnect();
}

validateMediaUrls().catch((err) => {
  console.error(err);
  process.exit(1);
});