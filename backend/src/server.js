import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { pool } from "./db.js";


const app = express();
app.use(express.json());

import { register } from "./auth.js";

app.get("/health", (req, res) => {
  res.json({ status: "Ok", message: "Backend running" });
});
app.post("/auth/reg",register);
app.get("/db-test", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
