import bcrypt from "bcrypt";
import  pool  from "./db.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Validation helpers
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    // Minimum 6 characters
    return password && password.length >= 6;
};

export const register = async(req,res)=>{
    try {
        const {name,email,password} = req.body;
        
        // Validation
        if(!name || !email || !password) {
            return res.status(400).json({message:"Name, email, and password are required"});
        }
        
        if(!validateEmail(email)) {
            return res.status(400).json({message:"Invalid email format"});
        }
        
        if(!validatePassword(password)) {
            return res.status(400).json({message:"Password must be at least 6 characters"});
        }
        
        // Check if email already exists
        const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
        if(existing.rows.length > 0) {
            return res.status(409).json({message:"Email already registered"});
        }
        
        const hashed = await bcrypt.hash(password,10);
        await pool.query(
            "INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4)",
            [name,email,hashed,"student"]
        );
        res.status(201).json({message:"User registered successfully"});
    } catch(err) {
        console.error("Register error:", err);
        res.status(500).json({message:"Registration failed. Please try again."});
    }
};


export const login = async(req,res)=>{
    try {
        const {email,password} = req.body;
        
        if(!email || !password) {
            return res.status(400).json({message:"Email and password are required"});
        }
        
        if(!validateEmail(email)) {
            return res.status(400).json({message:"Invalid email format"});
        }
        
        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );
        
        if(!result.rows.length){
            return res.status(401).json({message : "Email not found. Please register first."});
        }
        
        const user = result.rows[0];
        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({message:"Incorrect password"});
        }
        
        const token = jwt.sign(
            {id: user.id, role:user.role, name: user.name},
            process.env.JWT_SECRET,
            { expiresIn :"7d"}
        );
        
        res.json({token, role: user.role, name: user.name, message:"Logged in successfully"});
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Login failed. Please try again." });
    }
};