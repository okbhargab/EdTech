import express from "express";
import pool from "./db.js";

const router = express.Router();

router.get("/",async (req,res)=>{
    const result  = await pool.query(
        "SELECT id, title, description FROM tests"
    );
    res.json(result.rows);
});

router.get("/:id",async (req,res)=>{
    const testId = req.params.id;

    const questions = await pool.query(
        `SELECT id, question, options
        FROM questions
        WHERE test_id=$1`,
        [testId]
    );

    res.json(questions.rows);
});

router.post("/submit",async(req,res)=>{
    try {
        const {testId,answers} = req.body;
        const userId = req.user.id;
        
        if(!testId || !answers || typeof answers !== 'object') {
            return res.status(400).json({message: "Invalid test submission"});
        }
        
        // Verify test exists
        const testExists = await pool.query(
            "SELECT id FROM tests WHERE id=$1", [testId]
        );
        if(!testExists.rows.length) {
            return res.status(404).json({message: "Test not found"});
        }

        const correct = await pool.query(
            "SELECT id, correct_answer FROM questions WHERE test_id=$1",
            [testId]
        );

        let score = 0;
        correct.rows.forEach(q=>{
            if(answers[q.id] === q.correct_answer){
                score++;
            }
        });

        await pool.query(
            "INSERT INTO submissions(user_id, test_id, score) VALUES ($1,$2,$3)",
            [userId,testId,score]
        );

        res.json({score, totalQuestions: correct.rows.length, message: "Test submitted successfully"});
    } catch(err) {
        console.error("Test submission error:", err);
        res.status(500).json({message: "Failed to submit test"});
    }
});

router.get("/:id/result",async(req,res)=>{
    const userId = req.user.id;
    const testId = req.params.id;

    const result = await pool.query(
        `SELECT score, submitted_at
        FROM submissions
        WHERE user_id = $1 AND test_id=$2
        ORDER BY submitted_at DESC LIMIT 1`,
        [userId,testId]
    );

    res.json(result.rows[0] || null);
});

export default router;