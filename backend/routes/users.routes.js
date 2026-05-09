import express from "express";
import { getProfile, updateProfile } from "../controllers/users.controllers.js";
import { authMiddleware } from "../src/middleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

export default router;
