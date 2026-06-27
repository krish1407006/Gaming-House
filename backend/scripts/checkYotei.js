import "dotenv/config";
import Game from "../models/Game.js";
import connectDB from "../config/database.js";

async function check() {
  await connectDB();
  const g = await Game.findOne({ title: "Ghost of Yotei" }).select("title poster screenshots").lean();
  console.log("Title:", g.title);
  console.log("Poster:", g.poster);
  console.log("Screenshots:");
  (g.screenshots || []).forEach((u, i) => console.log(`  [${i}] ${u}`));
  process.exit(0);
}
check();
