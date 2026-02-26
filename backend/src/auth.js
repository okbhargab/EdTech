import bcrypt from "bcrypt";
import  pool  from "./db.js"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async(req,res)=>{
    const {name,email,password} = req.body;
    const hashed = await bcrypt.hash(password,10);
    await pool.query(
        "INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4)",
        [name,email,hashed,"student"]
    );
    res.json({message:"User registered"});
};

export const login = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );
    
        if(!result.rows.length){
            return res.status(401).json({message : "Invalid credentials"});
        }
    
        const user = result.rows[0];
        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({message:"Wrong password"});
        }
    
        const token = jwt.sign(
            {id: user.id, role:user.role},
            process.env.JWT_SECRET,
            { expiresIn :"1h"}
        );
    
        res.json({token,message:"Logged in Successfully"});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });

    }
}