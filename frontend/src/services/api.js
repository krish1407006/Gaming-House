import { errorHandler } from '../utils/errorHandler.js';

function normalizeBaseUrl(url) {
  return (url || "").trim().replace(/\/+$/, "");
}

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || "https://gaming-house.onrender.com"
);

export { API_BASE_URL };
const CACHE_PREFIX = 'gh_v6_';
const CACHE_TTL = 30 * 60 * 1000;

function purgeLegacyCache() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("gh_") && !key.startsWith(CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {}
}

purgeLegacyCache();

const PUBLIC_ENDPOINTS = [
  '/api/games',
  '/api/games/trending',
  '/api/games/homepage',
  '/health',
];

function isPublicEndpoint(endpoint) {
  if (PUBLIC_ENDPOINTS.some((p) => endpoint.startsWith(p))) return true;
  return /^\/api\/games\/[^/]+(\/ratings|\/downloads)?$/.test(endpoint);
}

function getCache(key, { allowStale = false } = {}) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      if (!allowStale) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
    }
    return data;
  } catch { return null; }
}

function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, expiry: Date.now() + CACHE_TTL }));
  } catch {}
}

export function peekCache(key) {
  return getCache(key);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, config, { retries = 2, retryDelay = 1000, timeout = 60000 } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { ...config, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt < retries) {
        await sleep(retryDelay * (attempt + 1));
      }
    }
  }

  throw lastError;
}

function clearGameCache(gameId) {
  try {
    Object.keys(localStorage)
      .filter((k) => {
        if (gameId) {
          return k === CACHE_PREFIX + 'game_' + gameId;
        }
        return (
          k.startsWith(CACHE_PREFIX + 'games_') ||
          k.startsWith(CACHE_PREFIX + 'homepage_') ||
          k.startsWith(CACHE_PREFIX + 'trending_') ||
          k.startsWith(CACHE_PREFIX + 'game_')
        );
      })
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}



class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this._memCache = {};
    this._staticDataPromise = null;
  }

  buildUrl(endpoint) {
    return `${this.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  }

  async fetchStaticSnapshot(filename) {
    try {
      const res = await fetch(`/data/${filename}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.games?.length ? data : null;
    } catch {
      return null;
    }
  }

  async loadStaticDataIntoCache() {
    if (this._staticDataPromise) return this._staticDataPromise;

    this._staticDataPromise = Promise.allSettled([
      this.fetchStaticSnapshot("homepage.json").then(data => {
        if (data?.games?.length) {
          setCache('homepage_1_8', data);
          this._memCache['homepage_1_8'] = data;
        }
      }),
      this.fetchStaticSnapshot("trending.json").then(data => {
        if (data?.games?.length) {
          setCache('trending_page=1&limit=8', data);
          this._memCache['trending_page=1&limit=8'] = data;
        }
      }),
    ]);

    return this._staticDataPromise;
  }

  refreshInBackground(endpoint, cacheKey) {
    this.request(endpoint)
      .then((r) => { if (r) setCache(cacheKey, r); })
      .catch(() => {});
  }

  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    
    // Reduce logging for frequently called endpoints
    const isWatchlistRequest = endpoint.includes('/watchlist/check/');
    const isGameRequest = endpoint.includes('/api/games');
    const shouldLog = !isWatchlistRequest && (Math.random() < 0.3 || !isGameRequest); // Log 30% of requests
    
    if (shouldLog) {
      console.log("🌐 API Request:", options.method || "GET", url);
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (!isPublicEndpoint(endpoint)) {
      const token = await this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const useRetry = (options.method || "GET") === "GET" && isPublicEndpoint(endpoint);

    try {
      const response = useRetry
        ? await fetchWithRetry(url, config)
        : await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      if (shouldLog) {
        console.log("🌐 Response:", response.status, result);
      }
      return result;
    } catch (error) {
      const shouldSilence = isWatchlistRequest || isGameRequest;
      errorHandler.handleApiError(error, endpoint, shouldSilence);

      if (isGameRequest && (options.method || "GET") === "GET") {
        const cacheKey = endpoint.includes("/homepage")
          ? "homepage_" + (new URL(url).searchParams.get("page") || "1") + "_" + (new URL(url).searchParams.get("limit") || "20")
          : endpoint.includes("/trending")
            ? "trending_" + new URL(url).searchParams.toString()
            : endpoint.startsWith("/api/games/") && !endpoint.includes("/rate")
              ? "game_" + endpoint.split("/")[3]?.split("?")[0]
              : endpoint.startsWith("/api/games")
                ? "games_" + new URL(url).searchParams.toString()
                : null;
        if (cacheKey) {
          const stale = getCache(cacheKey, { allowStale: true });
          if (stale) return stale;
        }
      }

      throw error;
    }
  }

  async getAuthToken() {
    try {
      if (!window.__clerk_token_getter) return null;

      for (let attempt = 0; attempt < 3; attempt++) {
        const token = await window.__clerk_token_getter();
        if (token) return token;
        if (attempt < 2) {
          await sleep(200 * (attempt + 1));
        }
      }
    } catch (error) {
      console.warn("Failed to get auth token:", error);
    }
    return null;
  }

  async getGames(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/games${queryString ? `?${queryString}` : ""}`;
    const cacheKey = 'games_' + queryString;
    const cached = getCache(cacheKey);
    if (cached) {
      this.request(endpoint).then((r) => { if (r) setCache(cacheKey, r); }).catch(() => {});
      return cached;
    }
    const result = await this.request(endpoint);
    if (result) setCache(cacheKey, result);
    return result;
  }

  peekGameById(gameId) {
    return getCache('game_' + gameId);
  }

  async getGameById(gameId, { forceRefresh = false } = {}) {
    const cacheKey = 'game_' + gameId;
    if (forceRefresh) {
      clearGameCache(gameId);
    }
    const cached = getCache(cacheKey);
    if (cached && !forceRefresh) {
      this.request(`/api/games/${gameId}`).then((r) => { if (r) setCache(cacheKey, r); }).catch(() => {});
      return cached;
    }
    const result = await this.request(`/api/games/${gameId}`);
    if (result) setCache(cacheKey, result);
    return result;
  }

  async getGameRatings(gameId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/games/${gameId}/ratings${
      queryString ? `?${queryString}` : ""
    }`;
    return this.request(endpoint);
  }

  // Rating endpoints
  async createOrUpdateRating(gameId, ratingData) {
    const result = await this.request(`/api/games/${gameId}/rate`, {
      method: "POST",
      body: JSON.stringify(ratingData),
    });
    clearGameCache(gameId);
    return result;
  }

  async deleteRating(gameId) {
    const result = await this.request(`/api/games/${gameId}/rate`, {
      method: "DELETE",
    });
    clearGameCache(gameId);
    return result;
  }

  async markReviewHelpful(ratingId) {
    return this.request(`/api/games/ratings/${ratingId}/helpful`, {
      method: "POST",
    });
  }

  async removeHelpfulMark(ratingId) {
    return this.request(`/api/games/ratings/${ratingId}/helpful`, {
      method: "DELETE",
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.request("/api/users/profile");
  }

  async getCurrentUser() {
    return this.request("/api/users/me");
  }

  // Watchlist Methods (Backend integration)
  async getWatchlist() {
    return this.request("/api/watchlist");
  }

  async addToWatchlist(gameId) {
    console.log("🎬 addToWatchlist called with gameId:", gameId);
    const result = await this.request("/api/watchlist/add", {
      method: "POST",
      body: JSON.stringify({ gameId }),
    });
    console.log("🎬 addToWatchlist result:", result);
    return result;
  }

  async removeFromWatchlist(gameId) {
    return this.request(`/api/watchlist/${gameId}`, {
      method: "DELETE",
    });
  }

  async clearWatchlist() {
    return this.request("/api/watchlist", {
      method: "DELETE",
    });
  }

  async checkWatchlistStatus(gameId) {
    return this.request(`/api/watchlist/check/${gameId}`);
  }

  // Legacy localStorage fallback methods
  getWatchlistLocal(userId) {
    try {
      const savedWatchlist = localStorage.getItem(`watchlist_${userId}`);
      return savedWatchlist ? JSON.parse(savedWatchlist) : [];
    } catch (error) {
      console.error("Error getting watchlist:", error);
      return [];
    }
  }

  addToWatchlistLocal(userId, gameId) {
    try {
      const watchlist = this.getWatchlistLocal(userId);
      if (!watchlist.includes(gameId)) {
        watchlist.push(gameId);
        localStorage.setItem(`watchlist_${userId}`, JSON.stringify(watchlist));
      }
      return true;
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      return false;
    }
  }

  removeFromWatchlistLocal(userId, gameId) {
    try {
      const watchlist = this.getWatchlistLocal(userId);
      const updatedWatchlist = watchlist.filter((id) => id !== gameId);
      localStorage.setItem(
        `watchlist_${userId}`,
        JSON.stringify(updatedWatchlist)
      );
      return true;
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      return false;
    }
  }

  clearWatchlistLocal(userId) {
    try {
      localStorage.removeItem(`watchlist_${userId}`);
      return true;
    } catch (error) {
      console.error("Error clearing watchlist:", error);
      return false;
    }
  }

  // Admin Methods for Game Management
  async getAdminGames(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/admin/games${queryString ? `?${queryString}` : ""}`;
    return this.request(endpoint);
  }

  async createGame(gameData) {
    try {
      console.log("� Creating new game:", gameData.title);
      const result = await this.request("/api/admin/games", {
        method: "POST",
        body: JSON.stringify(gameData),
      });
      clearGameCache();
      return result;
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  }

  async updateGame(gameId, gameData) {
    try {
      console.log("� Updating game:", gameId);
      const result = await this.request(`/api/admin/games/${gameId}`, {
        method: "PUT",
        body: JSON.stringify(gameData),
      });
      clearGameCache();
      return result;
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  }

  async deleteGame(gameId) {
    try {
      console.log("� Deleting game:", gameId);
      const result = await this.request(`/api/admin/games/${gameId}`, {
        method: "DELETE",
      });
      clearGameCache();
      return result;
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  }

  async getAdminStats() {
    try {
      console.log("📊 Fetching admin statistics");
      return await this.request("/api/admin/stats");
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      throw error;
    }
  }

  async toggleGameFeatured(gameId) {
    try {
      console.log("⭐ Toggling featured status for game:", gameId);
      return await this.request(`/api/admin/games/${gameId}/featured`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Error toggling featured status:", error);
      throw error;
    }
  }

  async getTrending(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/games/trending${queryString ? `?${queryString}` : ""}`;
    const cacheKey = 'trending_' + queryString;
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;

    try {
      const memCached = this._memCache[cacheKey];
      if (memCached) {
        this.refreshInBackground(endpoint, cacheKey);
        return memCached;
      }
      const cached = getCache(cacheKey);
      if (cached) {
        this.refreshInBackground(endpoint, cacheKey);
        return cached;
      }
      const data = await this.request(endpoint);
      if (data) {
        setCache(cacheKey, data);
        this._memCache[cacheKey] = data;
      }
      return data;
    } catch (error) {
      const stale = this._memCache[cacheKey] || getCache(cacheKey, { allowStale: true });
      if (stale) return stale;
      const staticData = page === 1 ? await this.fetchStaticSnapshot("trending.json") : null;
      if (staticData) {
        setCache(cacheKey, staticData);
        this._memCache[cacheKey] = staticData;
        return staticData;
      }
      console.error("Error fetching trending games:", error);
      throw error;
    }
  }

  async toggleGameTrending(gameId, trending) {
    try {
      return await this.request(`/api/admin/games/trending/${gameId}`, {
        method: "PUT",
        body: JSON.stringify({ trending }),
      });
    } catch (error) {
      console.error("Error toggling trending status:", error);
      throw error;
    }
  }

  async getAdminTrending() {
    try {
      return await this.request("/api/admin/games/trending-list");
    } catch (error) {
      console.error("Error fetching admin trending:", error);
      throw error;
    }
  }

  async reorderTrending(orderedIds) {
    try {
      return await this.request("/api/admin/games/reorder-trending", {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      });
    } catch (error) {
      console.error("Error reordering trending:", error);
      throw error;
    }
  }

  async autoSetTrending() {
    try {
      return await this.request("/api/admin/games/auto-trending", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error auto-setting trending:", error);
      throw error;
    }
  }

  peekHomepage(page = 1, limit = 20, { allowStale = false } = {}) {
    const key = 'homepage_' + page + '_' + limit;
    const memCached = this._memCache[key];
    if (memCached) return memCached;
    return getCache(key, { allowStale });
  }

  async getHomepage(page = 1, limit = 20) {
    const endpoint = `/api/games/homepage?page=${page}&limit=${limit}`;
    const cacheKey = 'homepage_' + page + '_' + limit;

    try {
      const memCached = this._memCache[cacheKey];
      if (memCached) {
        this.refreshInBackground(endpoint, cacheKey);
        return memCached;
      }
      const cached = getCache(cacheKey);
      if (cached) {
        this.refreshInBackground(endpoint, cacheKey);
        return cached;
      }
      const data = await this.request(endpoint);
      if (data) {
        setCache(cacheKey, data);
        this._memCache[cacheKey] = data;
      }
      return data;
    } catch (error) {
      const stale = this._memCache[cacheKey] || getCache(cacheKey, { allowStale: true });
      if (stale) return stale;
      const staticData = page === 1 ? await this.fetchStaticSnapshot("homepage.json") : null;
      if (staticData) {
        setCache(cacheKey, staticData);
        this._memCache[cacheKey] = staticData;
        return staticData;
      }
      console.error("Error fetching homepage games:", error);
      throw error;
    }
  }

  peekTrending(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const key = 'trending_' + queryString;
    const memCached = this._memCache[key];
    if (memCached) return memCached;
    return getCache(key);
  }

  peekGames(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return getCache('games_' + queryString);
  }

  async prefetchCritical() {
    await Promise.allSettled([
      fetch("/data/homepage.json").catch(() => {}),
      fetch("/data/trending.json").catch(() => {}),
      this.getHomepage(1, 8).catch(() => {}),
    ]);
  }

  async getAdminHomepage() {
    try {
      return await this.request("/api/admin/games/homepage-list");
    } catch (error) {
      console.error("Error fetching admin homepage:", error);
      throw error;
    }
  }

  async toggleGameHomepage(gameId, showOnHomepage) {
    try {
      return await this.request(`/api/admin/games/homepage/${gameId}`, {
        method: "PUT",
        body: JSON.stringify({ showOnHomepage }),
      });
    } catch (error) {
      console.error("Error toggling homepage status:", error);
      throw error;
    }
  }

  async reorderHomepage(orderedIds) {
    try {
      return await this.request("/api/admin/games/reorder-homepage", {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      });
    } catch (error) {
      console.error("Error reordering homepage:", error);
      throw error;
    }
  }

  async bulkUpdateGames(gameIds, updateData) {
    try {
      console.log("🔄 Bulk updating games:", gameIds.length);
      return await this.request("/api/admin/games/bulk", {
        method: "PATCH",
        body: JSON.stringify({ gameIds, updateData }),
      });
    } catch (error) {
      console.error("Error bulk updating games:", error);
      throw error;
    }
  }

  // Download Methods
  async getGameDownloads(gameId) {
    return this.request(`/api/games/${gameId}/downloads`);
  }

  async adminGetDownloads(gameId) {
    return this.request(`/api/admin/games/${gameId}/downloads`);
  }

  async addDownload(gameId, data) {
    return this.request(`/api/admin/games/${gameId}/downloads`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDownload(gameId, downloadId, data) {
    return this.request(`/api/admin/games/${gameId}/downloads/${downloadId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteDownload(gameId, downloadId) {
    return this.request(`/api/admin/games/${gameId}/downloads/${downloadId}`, {
      method: "DELETE",
    });
  }

  async updateSteamAppId(gameId, steamAppId) {
    return this.request(`/api/admin/games/${gameId}/steam-app`, {
      method: "PUT",
      body: JSON.stringify({ steamAppId }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
