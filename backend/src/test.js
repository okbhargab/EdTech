import express from "express";
import {pool} from "./db.js";

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
    const {testId,answers} = req.body;
    const userId = req.user.id;

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

    res.json({score});
});

router.get("/:id/result",async(req,res)=>{
    const userId = req.user.id;
    const testId = req.params.id;

    const result = await pool.query(
        `SELECT score, submitted_at
        FROM submissions
        WHERE user_id = $1 AND test_id=$2`,
        [userId,testId]
    );

    res.json(result.rows[0]);
});

export default router;