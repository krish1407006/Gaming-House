import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.use(requireAuth());
router.use(requireAdmin());

router.get("/users", adminController.getUsers);
router.put("/users/:id/ban", adminController.banUser);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/:id/admin", adminController.setUserAdminStatus);

router.get("/games", adminController.getAllGames);
router.post("/games", adminController.createGame);
router.put("/games/:id", adminController.updateGame);
router.delete("/games/:id", adminController.deleteGame);
router.put("/games/:id/status", adminController.toggleGameStatus);
router.put("/games/:id/featured", adminController.toggleGameFeatured);
router.put("/games/:id/trending", adminController.toggleGameTrending);
router.post("/games/auto-trending", adminController.autoSetTrending);
router.get("/games/:id/ratings", adminController.getGameRatingsAdmin);

router.get("/stats", adminController.getDashboardStats);

export default router;
