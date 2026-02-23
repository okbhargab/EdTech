import db from "../src/db.js";

export const getOverview = async (req, res) => {
  try {
    const users = await db.query("SELECT COUNT(*) FROM users");
    const tests = await db.query("SELECT COUNT(*) FROM tests");
    const submissions = await db.query("SELECT COUNT(*) FROM submissions");
    const aiQueries = await db.query(
      "SELECT COUNT(*) FROM chat_messages WHERE role='user'"
    );

    const dailyUsage = await db.query(`
      SELECT DATE(created_at) AS date,
             COUNT(*)::int AS count
      FROM chat_messages
      WHERE role='user'
      GROUP BY DATE(created_at)
      ORDER BY date;
    `);

    res.json({
      totalUsers: users.rows[0].count,
      totalTests: tests.rows[0].count,
      totalSubmissions: submissions.rows[0].count,
      totalAIQueries: aiQueries.rows[0].count,
      dailyUsage: dailyUsage.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin overview failed" });
  }
};