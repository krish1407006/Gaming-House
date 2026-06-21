import express from "express";
import {
  getChatResponse,
  getWelcomeMessage,
} from "../controllers/chatbotController.js";

const router = express.Router();

// Chat endpoint - process user queries
router.post("/", getChatResponse);

// Welcome message endpoint
router.get("/welcome", getWelcomeMessage);

export default router;
