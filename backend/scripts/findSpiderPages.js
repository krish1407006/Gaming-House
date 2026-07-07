import "dotenv/config";

const SPIDER_ID = "6a4d2477a9d917dc9f4baf56";
const BASE = "https://gaming-house.onrender.com/api/games";

async function findSpiderPages() {
  for (let page = 1; page <= 12; page++) {
    const res = await fetch(`${BASE}?page=${page}&limit=8`);
    const json = await res.json();
    const games = json?.games || [];
    const hit = games.find((g) => String(g._id) === SPIDER_ID);
    if (hit) console.log(`Spider-Man 2 on page ${page}: ${hit.title}`);
    const ids = games.map((g) => String(g._id));
    const dupesInPage = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dupesInPage.length) console.log(`  within-page dupes page ${page}:`, dupesInPage);
  }
}

findSpiderPages();