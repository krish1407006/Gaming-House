import { errorHandler } from '../utils/errorHandler.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://gaming-house-ten.vercel.app/";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
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

    // Add auth token if available
    const token = await this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

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
      // Use error handler for better error management
      const shouldSilence = isWatchlistRequest || isGameRequest;
      errorHandler.handleApiError(error, endpoint, shouldSilence);
      throw error;
    }
  }

  async getAuthToken() {
    // This will be implemented with Clerk's getToken method
    try {
      if (window.__clerk_token_getter) {
        const token = await window.__clerk_token_getter();
        // Only log token status occasionally to reduce spam
        if (Math.random() < 0.1) { // Log ~10% of the time
          console.log(
            "Auth token retrieved:",
            token ? "✓ Token exists" : "✗ No token"
          );
        }
        return token;
      } else if (Math.random() < 0.1) {
        console.warn("No token getter available");
      }
    } catch (error) {
      console.warn("Failed to get auth token:", error);
    }
    return null;
  }

  // Movie endpoints
  async getGames(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/games${queryString ? `?${queryString}` : ""}`;
    return this.request(endpoint);
  }

  async getGameById(gameId) {
    return this.request(`/api/games/${gameId}`);
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
    return this.request(`/api/games/${gameId}/rate`, {
      method: "POST",
      body: JSON.stringify(ratingData),
    });
  }

  async deleteRating(gameId) {
    return this.request(`/api/games/${gameId}/rate`, {
      method: "DELETE",
    });
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
  async createGame(gameData) {
    try {
      console.log("� Creating new game:", gameData.title);
      return await this.request("/api/admin/games", {
        method: "POST",
        body: JSON.stringify(gameData),
      });
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  }

  async updateGame(gameId, gameData) {
    try {
      console.log("� Updating game:", gameId);
      return await this.request(`/api/admin/games/${gameId}`, {
        method: "PUT",
        body: JSON.stringify(gameData),
      });
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  }

  async deleteGame(gameId) {
    try {
      console.log("� Deleting game:", gameId);
      return await this.request(`/api/admin/games/${gameId}`, {
        method: "DELETE",
      });
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
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/api/games/trending${queryString ? `?${queryString}` : ""}`;
      const data = await this.request(endpoint);
      return data;
    } catch (error) {
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

  // Homepage
  async getHomepage(page = 1, limit = 20) {
    try {
      const data = await this.request(`/api/games/homepage?page=${page}&limit=${limit}`);
      return data;
    } catch (error) {
      console.error("Error fetching homepage games:", error);
      throw error;
    }
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
