import dotenv from "dotenv";//if we dont add it will throw error
dotenv.config();
import db from "../src/db.js";
import { generateEmbedding } from "../services/embedding.service.js";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const askAI = async(req,res)=>{
  try {
    const {question} = req.body;

    await db.query(
      `INSERT INTO chat_messages (user_id, role, message)
      VALUES ($1, $2, $3)`,
      [req.user.id, "user", question]
    );
    if(!question){
      return res.status(400).json({message:"Question is required"});
    }

    const embeddingArray = await generateEmbedding(question);
    const embedding = `[${embeddingArray.join(",")}]`;

    const result = await db.query(
      `
      SELECT content,
             embedding <-> $1::vector AS distance
      FROM content_chunks
      ORDER BY embedding <-> $1::vector
      LIMIT 3
      `,
      [embedding]
    );
    if(!result.rows.length){
      return res.json({
        answer:"I don’t have enough information in the syllabus to answer that."
      });
    }
    const context = result.rows.map(r => r.content).join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an AI tutor. Answer ONLY using the provided context. If answer is not found in context, say you don't know."
        },
        {
          role: "user",
          content: `
Context:
${context}

Question:
${question}
          `
        }
      ],
      temperature: 0.2,
    });

    const answer = completion.choices[0].message.content;
    await db.query(
  `INSERT INTO chat_messages (user_id, role, message)
   VALUES ($1, $2, $3)`,
  [req.user.id, "ai", answer]
);
    res.json({answer});
  } catch (err) {
    console.error("AI ask Error:",err);
    res.status(500).json({message:"AI failed"});
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT role, message
      FROM chat_messages
      WHERE user_id = $1
      ORDER BY created_at ASC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load history" });
  }
};
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

      const embeddingArray = await generateEmbedding(text);

      // Convert JS array → pgvector format
      const embedding = `[${embeddingArray.join(",")}]`;

      await db.query(
        `
        INSERT INTO content_chunks
          (source_type, source_id, topic, content, embedding)
        VALUES
          ($1, $2, $3, $4, $5::vector)
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
