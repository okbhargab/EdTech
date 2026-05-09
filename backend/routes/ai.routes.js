import express from "express";
import { 
  indexKnowledgeBase,
  askAI, 
  getChatHistory,
  explainAnswer,
  generateHint,
  getRecommendations,
  generateQuiz,
  generateTestFeedback
} from "../controllers/ai.controllers.js";
import { authMiddleware } from "../src/middleware.js";

const router = express.Router();

// Core AI features
router.post("/index", authMiddleware, indexKnowledgeBase);
router.post("/ask", authMiddleware, askAI);
router.get("/history", authMiddleware, getChatHistory);

// 🆕 New AI Features
router.post("/explain", authMiddleware, explainAnswer);
router.post("/hint", authMiddleware, generateHint);
router.get("/recommendations", authMiddleware, getRecommendations);
router.post("/quiz/generate", authMiddleware, generateQuiz);
router.post("/feedback", authMiddleware, generateTestFeedback);

export default router;
