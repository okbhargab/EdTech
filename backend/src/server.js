import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import  pool  from "./db.js";
console.log(process.env.DATABASE_URL);
const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(express.json());


import { register,login } from "./auth.js";
import { authMiddleware } from "./middleware.js";
import testRoutes from "./test.js";
import analyticsRoutes from "../routes/analytics.routes.js";
import aiRoutes from "../routes/ai.routes.js";


app.post("/auth/register",register);
app.post("/auth/login",login);

app.use("/tests",authMiddleware,testRoutes);
app.use("/analytics",analyticsRoutes);
app.use("/ai", aiRoutes);


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


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
