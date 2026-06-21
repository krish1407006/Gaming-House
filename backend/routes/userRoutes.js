import express from "express";
import { requireAuth } from "@clerk/express";
import { checkAdmin } from "../middleware/admin.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.use(checkAdmin());

router.get("/me", requireAuth(), userController.getCurrentUser);
router.get("/profile", requireAuth(), userController.getCurrentUserProfile);
router.put("/metadata", requireAuth(), userController.updateUserMetadata);
router.get("/me/stats", requireAuth(), userController.getCurrentUserStats);
router.get("/me/ratings", requireAuth(), userController.getCurrentUserRatings);
router.get("/:id", requireAuth(), userController.getUserById);
router.get("/:id/ratings", requireAuth(), userController.getUserRatings);

export default router;
