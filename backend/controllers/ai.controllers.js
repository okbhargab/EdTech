import dotenv from "dotenv";//if we dont add it will throw error
dotenv.config();
import db from "../src/db.js";
import { generateEmbedding } from "../services/embedding.service.js";

export const indexKnowledgeBase = async (req, res) => {
  try {
    // 1️⃣ Clear old embeddings (safe during dev)
    await db.query("DELETE FROM content_chunks");

    // 2️⃣ Fetch syllabus content (questions + answers)
    const result = await db.query(
      "SELECT id, question, correct_answer FROM questions"
    );

    for (const row of result.rows) {
      const text = `
Question:
${row.question}

Correct Answer:
${row.correct_answer}
      `.trim();

      const embedding = await generateEmbedding(text);

      await db.query(
        `
        INSERT INTO content_chunks
          (source_type, source_id, topic, content, embedding)
        VALUES
          ($1, $2, $3, $4, $5)
        `,
        [
          "question",
          row.id,
          "general",
          text,
          embedding,
        ]
      );
    }

    res.json({
      message: "Knowledge base indexed successfully",
      indexed: result.rows.length,
    });
  } catch (err) {
    console.error("Indexing error:", err);
    res.status(500).json({ message: "Indexing failed" });
  }
};
