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

export function appendCacheBuster(url, game) {
  if (!url || typeof url !== "string") return url;
  if (!game?.updatedAt) return url;

  const ts = new Date(game.updatedAt).getTime();
  if (Number.isNaN(ts)) return url;

  const separator = url.includes("?") ? "&" : "?";
  return url + separator + "v=" + ts;
}

export function getGameImageUrl(game) {
  const raw = game?.image || game?.poster || "";
  const url = normalizeImageUrl(raw);
  return appendCacheBuster(url, game);
}

export function getScreenshotImageUrl(game, screenshot) {
  const url = normalizeImageUrl(screenshot);
  return appendCacheBuster(url, game);
}