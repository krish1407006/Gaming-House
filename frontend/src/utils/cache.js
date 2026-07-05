const CACHE_PREFIX = 'gh_cache_';
const DEFAULT_TTL = 5 * 60 * 1000;

export function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, expiry: Date.now() + ttl })
    );
  } catch {}
}

export function clearCache(pattern) {
  try {
    const prefix = CACHE_PREFIX + pattern;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export async function fetchWithCache({ key, fetcher, ttl = DEFAULT_TTL, onData }) {
  const cached = getCached(key);
  if (cached) {
    onData(cached);
  }
  try {
    const fresh = await fetcher();
    setCache(key, fresh, ttl);
    onData(fresh);
    return fresh;
  } catch (e) {
    if (!cached) throw e;
    return cached;
  }
}
