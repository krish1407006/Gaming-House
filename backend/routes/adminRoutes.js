import express from "express";
import { requireAuth } from "@clerk/express";
import { requireAdmin } from "../middleware/admin.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.use(requireAuth());
router.use(requireAdmin());

router.get("/users", adminController.getUsers);
router.put("/users/:id/ban", adminController.banUser);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/:id/admin", adminController.setUserAdminStatus);

router.get("/movies", adminController.getAllMovies);
router.post("/movies", adminController.createMovie);
router.put("/movies/:id", adminController.updateMovie);
router.delete("/movies/:id", adminController.deleteMovie);
router.put("/movies/:id/status", adminController.toggleMovieStatus);
router.put("/movies/:id/featured", adminController.toggleMovieFeatured);
router.get("/movies/:id/ratings", adminController.getMovieRatingsAdmin);

router.get("/stats", adminController.getDashboardStats);

export default router;
