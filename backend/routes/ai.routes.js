import express from "express";
import { indexKnowledgeBase } from "../controllers/ai.controllers.js";
import { authMiddleware } from "../src/middleware.js";

const router = express.Router();

// Later: restrict to admin only
router.post("/index", authMiddleware, indexKnowledgeBase);

export default router;
