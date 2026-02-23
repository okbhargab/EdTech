import express from "express";
import { getOverview } from "../controllers/admin.controllers.js";
import { authMiddleware, adminMiddleware } from "../src/middleware.js";

const router = express.Router();

router.get(
  "/overview",
  authMiddleware,
  adminMiddleware,
  getOverview
);

export default router;