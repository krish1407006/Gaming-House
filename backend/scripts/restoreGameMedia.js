import "dotenv/config";
import mongoose from "mongoose";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

function extractSteamAppId(game) {
  if (game.steamAppId) return String(game.steamAppId);

  const sources = [game.poster, game.backdrop, ...(game.screenshots || [])];
  for (const url of sources) {
    const match = String(url || "").match(/steamstatic\.com\/steam\/apps\/(\d+)/);
    if (match) return match[1];
  }

  return null;
}

function buildSteamMedia(appId, poster) {
  const base = `https://cdn.akamai.steamstatic.com/steam/apps/${appId}`;
  const screenshots = [
    `${base}/header.jpg`,
    `${base}/library_hero.jpg`,
    `${base}/capsule_616x353.jpg`,
  ];

  if (poster && !screenshots.includes(poster)) {
    screenshots.unshift(poster);
  }

  return {
    backdrop: poster || `${base}/header.jpg`,
    screenshots: [...new Set(screenshots)],
    steamAppId: Number(appId),
  };
}

async function restoreGameMedia() {
  await connectDB();

  const games = await Game.find({ isActive: true });
  let updated = 0;

  for (const game of games) {
    const update = {};
    const appId = extractSteamAppId(game);

    if (!game.backdrop && game.poster) {
      update.backdrop = game.poster;
    }

    if (!game.screenshots?.length) {
      if (appId) {
        Object.assign(update, buildSteamMedia(appId, game.poster));
      } else if (game.poster) {
        update.screenshots = [game.poster];
        if (!update.backdrop) update.backdrop = game.poster;
      }
    }

    if (Object.keys(update).length > 0) {
      await Game.updateOne({ _id: game._id }, { $set: update });
      updated += 1;
      console.log(`Restored media: ${game.title}`);
    }
  }

  console.log(`Done — updated ${updated} of ${games.length} games`);
  await mongoose.disconnect();
}

restoreGameMedia().catch((error) => {
  console.error("Failed to restore game media:", error);
  process.exit(1);
});