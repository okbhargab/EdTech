import pool from "../src/db.js";

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

export const getLeaderboard = async (req, res) => {
  try {
    const { period } = req.query; // week, month, all-time
    
    let dateFilter = "";
    if (period === "week") {
      dateFilter = "WHERE s.submitted_at >= NOW() - INTERVAL '7 days'";
    } else if (period === "month") {
      dateFilter = "WHERE s.submitted_at >= NOW() - INTERVAL '30 days'";
    }

    const result = await pool.query(`
      SELECT 
        u.id AS user_id, 
        u.name, 
        COUNT(s.id)::int AS test_count, 
        COALESCE(ROUND(AVG(s.score), 2), 0) AS average_score 
      FROM users u 
      JOIN submissions s ON u.id = s.user_id 
      ${dateFilter}
      GROUP BY u.id, u.name 
      ORDER BY average_score DESC 
      LIMIT 100
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

