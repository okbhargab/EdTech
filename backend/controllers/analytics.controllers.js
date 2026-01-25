import {pool} from "../src/db.js";

export const getAnalyticsSummary = async(req,res)=>{
    try{
        const userId = req.user.id;

        const result = await pool.query(
            `
            SELECT 
                COUNT(*)::int AS "totalTestsTaken",
                COALESCE(ROUND(AVG(score), 2), 0) AS "averageScore",
                COALESCE(MAX(score), 0) AS "bestScore",
                MAX(submitted_at) AS "lastAttempt"
            FROM submissions
            WHERE user_id = $1
            `,
            [userId]
        );

        res.status(200).json(result.rows[0]);
    }
    catch(err)
    {
        console.log("Anlytics error:",err);
        res.status(500).json({message : "Failed to fetch analytics" });
    }
}

export const getAnalyticsTrends = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware

    // 1️⃣ Attempts per day
    const attempts = await pool.query(
      `
    SELECT
        DATE(submitted_at) AS date,
        COUNT(*)::int AS count
    FROM submissions
    WHERE user_id = $1
    GROUP BY DATE(submitted_at)
    ORDER BY date;
      `,
      [userId]
    );

    // 2️⃣ Average score per day
    const scores = await pool.query(
      `
      SELECT
        DATE(submitted_at) AS date,
        ROUND(AVG(score), 2) AS "averageScore"
      FROM submissions
      WHERE user_id = $1
      GROUP BY DATE(submitted_at)
      ORDER BY date
      `,
      [userId]
    );

    res.status(200).json({
      attemptsOverTime: attempts.rows,
      scoreTrend: scores.rows
    });
  } catch (err) {
    console.error("Analytics trends error:", err);
    res.status(500).json({ message: "Failed to fetch trends" });
  }
};

