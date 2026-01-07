import pkg from "pg";
import dotenv from "dotenv";//if we dont add it will throw error
dotenv.config();
const {Pool} = pkg;
// console.log("DB USER:", process.env.DB_USER);
// console.log("DB PASSWORD:", process.env.DB_PASSWORD);
// console.log("DATABASE_URL:", process.env.DATABASE_URL);
// export const pool = new Pool({
//     connectionString:process.env.DATABASE_URL
// })


export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


// CREATE TABLE users (
//   id SERIAL PRIMARY KEY,
//   name TEXT NOT NULL,
//   email TEXT UNIQUE NOT NULL,
//   password TEXT NOT NULL,
//   role TEXT NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );


// postgres → admin (created the table)

// edtech_user → app user (used by Node)

