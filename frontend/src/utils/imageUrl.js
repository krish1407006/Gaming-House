export function normalizeImageUrl(url) {
  if (!url || typeof url !== "string") return url;

  const steamHeader = url.match(
    /shared\.akamai\.steamstatic\.com\/store_item_assets\/steam\/apps\/(\d+)(?:\/[a-f0-9]+)?\/header\.jpg/i
  );
  if (steamHeader) {
    return `https://cdn.akamai.steamstatic.com/steam/apps/${steamHeader[1]}/header.jpg`;
  }

  const steamLibraryHero = url.match(
    /shared\.akamai\.steamstatic\.com\/store_item_assets\/steam\/apps\/(\d+)(?:\/[a-f0-9]+)?\/library_hero\.jpg/i
  );
  if (steamLibraryHero) {
    return `https://cdn.akamai.steamstatic.com/steam/apps/${steamLibraryHero[1]}/library_hero.jpg`;
  }

  return url;
}

export function getGameImageUrl(game) {
  const raw = game?.image || game?.poster || "";
  let url = normalizeImageUrl(raw);
  if (url && game?.updatedAt) {
    const ts = new Date(game.updatedAt).getTime();
    if (!Number.isNaN(ts)) {
      const separator = url.includes("?") ? "&" : "?";
      url += separator + "v=" + ts;
    }
  }
  return url;
}