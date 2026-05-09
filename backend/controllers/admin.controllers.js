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

export const createTest = async (req, res) => {
  const client = await db.connect();
  try {
    const { title, description, questions } = req.body;

    if (!title || !description || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Invalid test data" });
    }

    await client.query("BEGIN");

    const testRes = await client.query(
      "INSERT INTO tests (title, description) VALUES ($1, $2) RETURNING id",
      [title, description]
    );
    const testId = testRes.rows[0].id;

    for (const q of questions) {
      await client.query(
        "INSERT INTO questions (test_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)",
        [testId, q.question, JSON.stringify(q.options), q.correctAnswer]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Test created successfully", testId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create test error:", err);
    res.status(500).json({ message: "Failed to create test" });
  } finally {
    client.release();
  }
};