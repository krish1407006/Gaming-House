import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../public/data");
const API = process.env.SYNC_API_URL || "https://gaming-house.onrender.com";

const SNAPSHOTS = [
  { file: "homepage.json", url: `${API}/api/games/homepage?page=1&limit=8` },
  { file: "trending.json", url: `${API}/api/games/trending?page=1&limit=8` },
];

async function fetchJson(url, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

mkdirSync(dataDir, { recursive: true });

for (const { file, url } of SNAPSHOTS) {
  const path = join(dataDir, file);
  try {
    const data = await fetchJson(url);
    writeFileSync(path, JSON.stringify(data));
    console.log(`Updated ${file}`);
  } catch (err) {
    if (existsSync(path)) {
      console.warn(`Keeping existing ${file} (${err.message})`);
    } else {
      writeFileSync(path, JSON.stringify({ games: [], pagination: { currentPage: 1, totalPages: 1 } }));
      console.warn(`Created empty ${file} (${err.message})`);
    }
  }
}