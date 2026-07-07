import "dotenv/config";

const BASE = "https://gaming-house.onrender.com/api/games";
const HOME = "https://gaming-house.onrender.com/api/games/homepage";
const TREND = "https://gaming-house.onrender.com/api/games/trending";

async function fetchAllPages(url, maxPages = 15) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(`${url}?page=${page}&limit=8`);
    const json = await res.json();
    const games = json?.games || json?.data?.games || [];
    const pag = json?.pagination || json?.data?.pagination;
    all.push(...games);
    if (!pag?.hasNextPage && page > 1) break;
    if (!games.length) break;
  }
  return all;
}

function reportDupes(label, games) {
  const ids = games.map((g) => String(g._id));
  const titles = games.map((g) => g.title);
  const dupeIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  const spider = games.filter((g) => /spider/i.test(g.title));
  console.log(`\n${label}: ${games.length} total, ${spider.length} spider titles, ${dupeIds.length} duplicate ids`);
  if (dupeIds.length) {
    const unique = [...new Set(dupeIds)];
    unique.forEach((id) => {
      const title = games.find((g) => String(g._id) === id)?.title;
      console.log(`  DUPLICATE: ${title} (${id})`);
    });
  }
  spider.forEach((g) => console.log(`  - ${g.title} (${g._id})`));
}

async function run() {
  const [allGames, homepage, trending] = await Promise.all([
    fetchAllPages(BASE),
    fetchAllPages(HOME),
    fetchAllPages(TREND),
  ]);
  reportDupes("All games (categories simulation)", allGames);
  reportDupes("Homepage infinite scroll", homepage);
  reportDupes("Trending infinite scroll", trending);
}

run();