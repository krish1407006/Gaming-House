import { getAuth } from "@clerk/express";
import * as userService from "../services/userService.js";
import * as gameService from "../services/gameService.js";
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

export const getAllGames = async (req, res) => {
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

    const result = await gameService.getGames({
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
    console.error("Error in admin getAllGames:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createGame = async (req, res) => {
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

    const result = await gameService.createGame(movieData, userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      message: "game created successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin createGame:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await gameService.updateGame(id, updateData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: "game updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin updateGame:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await gameService.deleteGame(id);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({ message: result.message });
  } catch (error) {
    console.error("Error in admin deleteGame:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleGameStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        error: "isActive must be a boolean value",
      });
    }

    const result = await gameService.toggleGameStatus(id, isActive);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      message: `game ${isActive ? "activated" : "deactivated"} successfully`,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin toggleGameStatus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleGameFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (typeof featured !== "boolean") {
      return res.status(400).json({
        error: "featured must be a boolean value",
      });
    }

    const result = await gameService.toggleGameFeatured(id, featured);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      message: `game ${featured ? "featured" : "unfeatured"} successfully`,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin toggleGameFeatured:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [gameStats, userStats] = await Promise.all([
      gameService.getGameStats(),
      Promise.resolve({ success: true, data: {} }),
    ]);

    if (!gameStats.success) {
      return res.status(500).json({ error: "Failed to fetch statistics" });
    }

    res.json({
      games: gameStats.data,
    });
  } catch (error) {
    console.error("Error in admin getDashboardStats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleGameTrending = async (req, res) => {
  try {
    const { id } = req.params;
    const { trending } = req.body;

    if (typeof trending !== "boolean") {
      return res.status(400).json({
        error: "trending must be a boolean value",
      });
    }

    const result = await gameService.toggleGameTrending(id, trending);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      message: `game ${trending ? "set as trending" : "removed from trending"} successfully`,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in admin toggleGameTrending:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const autoSetTrending = async (req, res) => {
  try {
    const result = await gameService.autoSetTrending();

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in admin autoSetTrending:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGameRatingsAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const result = await ratingService.getGameRatings(id, {
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
    console.error("Error in admin getGameRatingsAdmin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
