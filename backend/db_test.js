import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
});

try {
  await client.connect();
  const res = await client.query("SELECT NOW()");
  console.log("DB CONNECTED:", res.rows[0]);
  await client.end();
} catch (err) {
  console.error("DB CONNECTION FAILED:", err.message);
}
