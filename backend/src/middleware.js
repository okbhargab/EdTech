import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const authMiddleware = (req,res,next)=>{
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({ message: "No token" });
    
    const token = header.split(" ")[1];

    try{
        req.user = jwt.verify(token,process.env.JWT_SECRET);
        next();
    }
    catch(err){
        res.status(401).json({message:"Invalid token"});
    }
};