import express from "express";
import { indexKnowledgeBase,askAI, getChatHistory } from "../controllers/ai.controllers.js";
import { authMiddleware } from "../src/middleware.js";

const router = express.Router();

// Later: restrict to admin only
router.post("/index", authMiddleware, indexKnowledgeBase);
router.post("/ask", authMiddleware, askAI);
router.get("/history",authMiddleware,getChatHistory);

export default router;
