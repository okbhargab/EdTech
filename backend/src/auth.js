import bcrypt from "bcrypt";
import { pool } from "./db.js"

export const register = async(req,res)=>{
    const {name,email,password,role} = req.body;
    const hashed = await bcrypt.hash(password,10);
    await pool.query(
        "INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4)",
        [name,email,hashed,role]
    );
    res.json({message:"User registered"});
};