import express from "express";
import { indexKnowledgeBase,askAI } from "../controllers/ai.controllers.js";
import { authMiddleware } from "../src/middleware.js";

const router = express.Router();

// Later: restrict to admin only
router.post("/index", authMiddleware, indexKnowledgeBase);
router.post("/ask", authMiddleware, askAI);

export default router;
