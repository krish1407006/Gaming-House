import { requireAuth, getAuth } from "@clerk/express";
import { isUserAdmin } from "../services/userService.js";

export const requireAdmin = () => {
  return async (req, res, next) => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
        });
      }

      const adminStatus = await isUserAdmin(userId);

      if (!adminStatus) {
        return res.status(403).json({
          error: "Admin access required",
        });
      }

      req.isAdmin = true;
      next();
    } catch (error) {
      console.error("Error in admin middleware:", error);
      res.status(500).json({
        error: "Failed to verify admin status",
      });
    }
  };
};

export const checkAdmin = () => {
  return async (req, res, next) => {
    try {
      const { userId } = getAuth(req);

      if (userId) {
        req.isAdmin = await isUserAdmin(userId);
      } else {
        req.isAdmin = false;
      }

      next();
    } catch (error) {
      console.error("Error checking admin status:", error);
      req.isAdmin = false;
      next();
    }
  };
};

export const requireAdminOrOwner = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      const { userId } = getAuth(req);

      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
        });
      }

      const adminStatus = await isUserAdmin(userId);

      if (adminStatus) {
        req.isAdmin = true;
        return next();
      }

      const ownerId = getOwnerId(req);
      if (userId === ownerId) {
        req.isOwner = true;
        return next();
      }

      return res.status(403).json({
        error: "Access denied. Admin or owner access required",
      });
    } catch (error) {
      console.error("Error in admin/owner middleware:", error);
      res.status(500).json({
        error: "Failed to verify access permissions",
      });
    }
  };
};
