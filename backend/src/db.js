// import pkg from "pg";
// import dotenv from "dotenv";//if we dont add it will throw error
// dotenv.config();
// const {Pool} = pkg;

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   }
// });

// pool.connect()
//   .then(client => {
//     console.log("Connected as:", client.user);
//     client.release();
//   })
//   .catch(err => {
//     console.error("DB Connection Error:", err);
//   });


// export default pool;
// // CREATE TABLE users (
// //   id SERIAL PRIMARY KEY,
// //   name TEXT NOT NULL,
// //   email TEXT UNIQUE NOT NULL,
// //   password TEXT NOT NULL,
// //   role TEXT NOT NULL,
// //   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// // );


// // postgres → admin (created the table)

// // edtech_user → app user (used by Node)
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("Database connected successfully");
});

pool.on("error", (err) => {
  console.error("Unexpected DB error:", err);
});

export default pool;

