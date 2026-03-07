import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import  pool  from "./db.js";

const app = express();

// CORS configuration for production flexibility
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(express.json({ limit: "10mb" }));

// Input validation middleware
app.use((req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      console.error(`[${req.method} ${req.path}] Status ${res.statusCode}`);
    }
  });
  next();
});


import { register,login } from "./auth.js";
import { authMiddleware } from "./middleware.js";
import testRoutes from "./test.js";
import analyticsRoutes from "../routes/analytics.routes.js";
import aiRoutes from "../routes/ai.routes.js";
import adminRoutes from "../routes/admin.routes.js";

app.post("/auth/register",register);
app.post("/auth/login",login);

app.use("/tests",authMiddleware,testRoutes);
app.use("/analytics",analyticsRoutes);
app.use("/ai", aiRoutes);
app.use("/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "Ok", message: "Backend running" });
});

app.get("/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

app.get("/db-test", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});

pool.query("SELECT current_database(), inet_server_addr()")
  .then(res => console.log("DB Connected:", res.rows[0]))
  .catch(err => console.error("DB Connection Error:", err));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
