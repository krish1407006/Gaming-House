import "dotenv/config";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function check() {
  await connectDB();

  const all = await Game.find({}).select("title poster screenshots").sort({ title: 1 }).lean();

  console.log("=== GAMES WITHOUT SCREENSHOTS ===");
  let noScreenshots = 0;
  for (const g of all) {
    const count = g.screenshots?.length || 0;
    if (count === 0) {
      console.log(`  ${g.title} (poster: ${g.poster ? "OK" : "MISSING"})`);
      noScreenshots++;
    }
  }
  console.log(`\nTotal without screenshots: ${noScreenshots} / ${all.length}`);

  console.log("\n=== GAMES WITH SCREENSHOTS ===");
  for (const g of all) {
    const count = g.screenshots?.length || 0;
    if (count > 0) {
      console.log(`  ${g.title}: ${count} screenshots`);
    }
  }

  process.exit(0);
}
check();
