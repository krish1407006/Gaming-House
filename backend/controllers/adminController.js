import { getAuth } from "@clerk/express";
import * as userService from "../services/userService.js";
import * as movieService from "../services/movieService.js";
import * as ratingService from "../services/ratingService.js";

export const getUsers = async (req, res) => {
  try {
    const { limit, offset, emailAddress } = req.query;

    const result = await userService.getUsers({
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      emailAddress,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      users: result.data,
      totalCount: result.totalCount,
      pagination: {
        limit: parseInt(limit) || 10,
        offset: parseInt(offset) || 0,
      },
    });
  } catch (error) {
    console.error("Error in admin getUsers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const banUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const { banned = true } = req.body;

    const result = await userService.banUser(targetUserId, banned);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: banned
        ? "User banned successfully"
        : "User unbanned successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin banUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;

    const result = await userService.deleteUser(targetUserId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("Error in admin deleteUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const setUserAdminStatus = async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const { isAdmin = true } = req.body;

    const result = await userService.setUserAdminStatus(targetUserId, isAdmin);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: isAdmin
        ? "User promoted to admin"
        : "Admin privileges removed from user",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in setUserAdminStatus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllMovies = async (req, res) => {
  try {
    const {
      page,
      limit,
      genre,
      search,
      sortBy,
      sortOrder,
      activeOnly,
      featuredOnly,
    } = req.query;

    const result = await movieService.getMovies({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      genre,
      search,
      sortBy,
      sortOrder,
      activeOnly: activeOnly === "true",
      featuredOnly: featuredOnly === "true",
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in admin getAllMovies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createMovie = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const movieData = req.body;

    const requiredFields = [
      "title",
      "description",
      "director",
      "releaseDate",
      "duration",
      "language",
      "country",
    ];
    for (const field of requiredFields) {
      if (!movieData[field]) {
        return res.status(400).json({
          error: `${field} is required`,
        });
      }
    }

    const result = await movieService.createMovie(movieData, userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      message: "Movie created successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin createMovie:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await movieService.updateMovie(id, updateData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: "Movie updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin updateMovie:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await movieService.deleteMovie(id);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("Error in admin deleteMovie:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleMovieStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        error: "isActive must be a boolean value",
      });
    }

    const result = await movieService.toggleMovieStatus(id, isActive);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      message: `Movie ${isActive ? "activated" : "deactivated"} successfully`,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin toggleMovieStatus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleMovieFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (typeof featured !== "boolean") {
      return res.status(400).json({
        error: "featured must be a boolean value",
      });
    }

    const result = await movieService.toggleMovieFeatured(id, featured);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      message: `Movie ${featured ? "featured" : "unfeatured"} successfully`,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin toggleMovieFeatured:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [movieStats, userStats] = await Promise.all([
      movieService.getMovieStats(),
      Promise.resolve({ success: true, data: {} }),
    ]);

    if (!movieStats.success) {
      return res.status(500).json({ error: "Failed to fetch statistics" });
    }

    res.json({
      movies: movieStats.data,
    });
  } catch (error) {
    console.error("Error in admin getDashboardStats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMovieRatingsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const result = await ratingService.getMovieRatings(id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder,
      publicOnly: false,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in admin getMovieRatingsAdmin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
