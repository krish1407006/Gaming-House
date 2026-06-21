import { errorHandler } from '../utils/errorHandler.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://criticscore.onrender.com/";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Reduce logging for frequently called endpoints
    const isWatchlistRequest = endpoint.includes('/watchlist/check/');
    const isMovieRequest = endpoint.includes('/api/movies');
    const shouldLog = !isWatchlistRequest && (Math.random() < 0.3 || !isMovieRequest); // Log 30% of requests
    
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
      const shouldSilence = isWatchlistRequest || isMovieRequest;
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
  async getMovies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/movies${queryString ? `?${queryString}` : ""}`;
    return this.request(endpoint);
  }

  async getMovieById(movieId) {
    return this.request(`/api/movies/${movieId}`);
  }

  async getMovieRatings(movieId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/movies/${movieId}/ratings${
      queryString ? `?${queryString}` : ""
    }`;
    return this.request(endpoint);
  }

  // Rating endpoints
  async createOrUpdateRating(movieId, ratingData) {
    return this.request(`/api/movies/${movieId}/rate`, {
      method: "POST",
      body: JSON.stringify(ratingData),
    });
  }

  async deleteRating(movieId) {
    return this.request(`/api/movies/${movieId}/rate`, {
      method: "DELETE",
    });
  }

  async markReviewHelpful(ratingId) {
    return this.request(`/api/movies/ratings/${ratingId}/helpful`, {
      method: "POST",
    });
  }

  async removeHelpfulMark(ratingId) {
    return this.request(`/api/movies/ratings/${ratingId}/helpful`, {
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

  async addToWatchlist(movieId) {
    console.log("🎬 addToWatchlist called with movieId:", movieId);
    const result = await this.request("/api/watchlist/add", {
      method: "POST",
      body: JSON.stringify({ movieId }),
    });
    console.log("🎬 addToWatchlist result:", result);
    return result;
  }

  async removeFromWatchlist(movieId) {
    return this.request(`/api/watchlist/${movieId}`, {
      method: "DELETE",
    });
  }

  async clearWatchlist() {
    return this.request("/api/watchlist", {
      method: "DELETE",
    });
  }

  async checkWatchlistStatus(movieId) {
    return this.request(`/api/watchlist/check/${movieId}`);
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

  addToWatchlistLocal(userId, movieId) {
    try {
      const watchlist = this.getWatchlistLocal(userId);
      if (!watchlist.includes(movieId)) {
        watchlist.push(movieId);
        localStorage.setItem(`watchlist_${userId}`, JSON.stringify(watchlist));
      }
      return true;
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      return false;
    }
  }

  removeFromWatchlistLocal(userId, movieId) {
    try {
      const watchlist = this.getWatchlistLocal(userId);
      const updatedWatchlist = watchlist.filter((id) => id !== movieId);
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

  // Admin Methods for Movie Management
  async createMovie(movieData) {
    try {
      console.log("� Creating new game:", movieData.title);
      return await this.request("/api/admin/movies", {
        method: "POST",
        body: JSON.stringify(movieData),
      });
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  }

  async updateMovie(movieId, movieData) {
    try {
      console.log("� Updating game:", movieId);
      return await this.request(`/api/admin/movies/${movieId}`, {
        method: "PUT",
        body: JSON.stringify(movieData),
      });
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  }

  async deleteMovie(movieId) {
    try {
      console.log("� Deleting game:", movieId);
      return await this.request(`/api/admin/movies/${movieId}`, {
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

  async toggleMovieFeatured(movieId) {
    try {
      console.log("⭐ Toggling featured status for movie:", movieId);
      return await this.request(`/api/admin/movies/${movieId}/featured`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Error toggling featured status:", error);
      throw error;
    }
  }

  async bulkUpdateMovies(movieIds, updateData) {
    try {
      console.log("🔄 Bulk updating games:", movieIds.length);
      return await this.request("/api/admin/movies/bulk", {
        method: "PATCH",
        body: JSON.stringify({ movieIds, updateData }),
      });
    } catch (error) {
      console.error("Error bulk updating games:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
