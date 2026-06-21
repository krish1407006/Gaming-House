import { getAuth } from "@clerk/express";
import * as userService from "../services/userService.js";
import * as ratingService from "../services/ratingService.js";

export const getCurrentUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const result = await userService.getUserById(userId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentUserProfile = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const result = await userService.getUserProfile(userId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in getCurrentUserProfile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserMetadata = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { publicMetadata, privateMetadata } = req.body;

    if (!publicMetadata && !privateMetadata) {
      return res.status(400).json({
        error: "At least one of publicMetadata or privateMetadata is required",
      });
    }

    const result = await userService.updateUserMetadata(userId, {
      publicMetadata,
      privateMetadata,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in updateUserMetadata:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId: currentUserId } = getAuth(req);
    const { id: targetUserId } = req.params;

    if (currentUserId !== targetUserId && !req.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await userService.getUserById(targetUserId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentUserStats = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const result = await ratingService.getUserRatingStats(userId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in getCurrentUserStats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCurrentUserRatings = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { page, limit, sortBy, sortOrder } = req.query;

    const result = await ratingService.getUserRatings(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in getCurrentUserRatings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserRatings = async (req, res) => {
  try {
    const { userId: currentUserId } = getAuth(req);
    const { id: targetUserId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    if (currentUserId !== targetUserId && !req.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await ratingService.getUserRatings(targetUserId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      sortBy,
      sortOrder,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in getUserRatings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
