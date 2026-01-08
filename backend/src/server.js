import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());


import { register,login } from "./auth.js";
import { authMiddleware } from "./middleware.js";


app.post("/auth/reg",register);
app.post("/auth/login",login);



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



const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
