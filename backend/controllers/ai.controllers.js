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
            "You are a helpful AI tutor. Use the provided context to answer the user's questions if relevant. If the context is not relevant or does not contain the answer, you may use your general knowledge to help the student. Always be encouraging and educational."
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

    let answer = completion.choices[0].message.content;
    answer = answer.replace(/^["']|["']$/g, '').trim();
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

// 🆕 NEW: Explain a specific answer
export const explainAnswer = async (req, res) => {
  try {
    const { questionId, userAnswer, correctAnswer } = req.body;

    if (!questionId || !correctAnswer) {
      return res.status(400).json({ message: "questionId and correctAnswer required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert educator. Provide clear, concise explanations with examples."
        },
        {
          role: "user",
          content: `
A student answered this question as: "${userAnswer || 'Not answered'}"
The correct answer is: "${correctAnswer}"

Please provide:
1. Why the correct answer is right
2. Why their answer might be wrong (if applicable)
3. A simple example to understand better
          `
        }
      ],
      temperature: 0.7,
    });

    let explanation = completion.choices[0].message.content;
    explanation = explanation.replace(/^["']|["']$/g, '').trim();
    res.json({ explanation });
  } catch (err) {
    console.error("Explain error:", err);
    res.status(500).json({ message: "Failed to generate explanation" });
  }
};

// 🆕 NEW: Generate hints for a question
export const generateHint = async (req, res) => {
  try {
    const { question, difficulty = "medium" } = req.body;

    if (!question) {
      return res.status(400).json({ message: "question required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful tutor. Generate a ${difficulty} hint that guides without giving the answer away.`
        },
        {
          role: "user",
          content: `Provide a ${difficulty} hint for this question: ${question}`
        }
      ],
      temperature: 0.8,
    });

    let hint = completion.choices[0].message.content;
    hint = hint.replace(/^["']|["']$/g, '').trim();
    res.json({ hint });
  } catch (err) {
    console.error("Hint error:", err);
    res.status(500).json({ message: "Failed to generate hint" });
  }
};

// 🆕 NEW: Get personalized recommendations based on test performance
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's recent test performance
    const performanceResult = await db.query(
      `
      SELECT 
        s.score,
        s.test_id,
        t.title,
        COUNT(q.id) as question_count,
        STRING_AGG(DISTINCT q.topic, ',') as topics
      FROM submissions s
      JOIN tests t ON s.test_id = t.id
      LEFT JOIN questions q ON t.id = q.test_id
      WHERE s.user_id = $1
      GROUP BY s.id, s.score, s.test_id, t.title
      ORDER BY s.created_at DESC
      LIMIT 5
      `,
      [userId]
    );

    const avgScore = performanceResult.rows.reduce((sum, r) => sum + r.score, 0) / Math.max(performanceResult.rows.length, 1);
    const weakTopics = performanceResult.rows
      .filter(r => r.score < 60)
      .flatMap(r => r.topics.split(','))
      .slice(0, 3);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an educational advisor. Provide personalized learning recommendations."
        },
        {
          role: "user",
          content: `
A student has:
- Average Score: ${avgScore.toFixed(1)}%
- Weak Topics: ${weakTopics.join(', ') || 'None identified'}
- Recent Attempts: ${performanceResult.rows.length}

Provide 3-4 specific, actionable recommendations to improve their learning.
          `
        }
      ],
      temperature: 0.7,
    });

    let recommendations = completion.choices[0].message.content;
    recommendations = recommendations.replace(/^["']|["']$/g, '').trim();
    res.json({ 
      recommendations,
      avgScore: avgScore.toFixed(1),
      weakTopics
    });
  } catch (err) {
    console.error("Recommendations error:", err);
    res.status(500).json({ message: "Failed to generate recommendations" });
  }
};

// 🆕 NEW: Generate AI quiz on a topic
export const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty = "medium", questionCount = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "topic required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert question generator. Generate quiz questions in JSON format."
        },
        {
          role: "user",
          content: `
Generate ${questionCount} ${difficulty} level multiple choice questions on "${topic}".

Return as JSON array with this exact structure:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this is correct..."
  }
]

IMPORTANT: Return ONLY the JSON array, no other text.
          `
        }
      ],
      temperature: 0.8,
    });

    const content = completion.choices[0].message.content;
    const quiz = JSON.parse(content);
    res.json({ quiz });
  } catch (err) {
    console.error("Quiz generation error:", err);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
};

// 🆕 NEW: Generate AI feedback on test submission
export const generateTestFeedback = async (req, res) => {
  try {
    const { testId, score, totalMarks, wrongTopics = [] } = req.body;

    if (!testId || score === undefined || !totalMarks) {
      return res.status(400).json({ message: "testId, score, and totalMarks required" });
    }

    const percentage = ((score / totalMarks) * 100).toFixed(1);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a supportive educational mentor. Provide encouraging yet honest feedback."
        },
        {
          role: "user",
          content: `
A student scored ${score}/${totalMarks} (${percentage}%) on a test.
Topics where they struggled: ${wrongTopics.join(', ') || 'None specified'}

Provide:
1. Performance assessment (encouraging but honest)
2. Key areas to focus on
3. Specific action items for improvement
          `
        }
      ],
      temperature: 0.7,
    });

    let feedback = completion.choices[0].message.content;
    feedback = feedback.replace(/^["']|["']$/g, '').trim();
    res.json({ 
      feedback,
      score,
      percentage,
      wrongTopics
    });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Failed to generate feedback" });
  }
};
