import express from "express";
import { getAnalyticsSummary, getAnalyticsTrends, getLeaderboard } from "../controllers/analytics.controllers.js";
import { authMiddleware } from "../src/middleware.js";

const router = express.Router();

router.get("/summary", authMiddleware, getAnalyticsSummary);
router.get("/trends", authMiddleware, getAnalyticsTrends);
router.get("/leaderboard", authMiddleware, getLeaderboard);

export default router;