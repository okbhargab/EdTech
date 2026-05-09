import express from "express";
import { getOverview, createTest } from "../controllers/admin.controllers.js";
import { authMiddleware, adminMiddleware } from "../src/middleware.js";

const router = express.Router();

router.get(
  "/overview",
  authMiddleware,
  adminMiddleware,
  getOverview
);

router.post(
  "/tests",
  authMiddleware,
  adminMiddleware,
  createTest
);

export default router;