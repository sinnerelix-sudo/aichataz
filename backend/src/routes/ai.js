import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";

const r = Router();

const UNIVERSAL_KEY = "sk-emergent-154FdDaA604615b2b7"; // Provided by user
const LLM_BASE_URL = "https://integrations.emergentagent.com/llm/v1/chat/completions";

r.post("/chat", async (req, res) => {
  const { bot_id, user_message, external_user_id } = req.body;
  const db = getDB();
  
  // 1. Fetch Bot Config
  const bot = await db.collection("bots").findOne({ _id: new (await import('mongodb')).ObjectId(bot_id) });
  if (!bot) return res.status(404).json({ error: "Bot not found" });

  // 2. Fetch Conversation History (Memory)
  const history = await db.collection("conversations")
    .find({ bot_id: bot._id, external_user_id })
    .sort({ timestamp: 1 })
    .limit(10)
    .toArray();

  const messages = [
    { role: "system", content: `${bot.prompt}\n\nKNOWLEDGE BASE:\n${bot.knowledge_base}` },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: user_message }
  ];

  try {
    // 3. Call Gemini (via Universal Key)
    const response = await axios.post(LLM_BASE_URL, {
      model: "google/gemini-2.0-flash", // Using your preferred model
      messages: messages,
      temperature: 0.7
    }, {
      headers: { "Authorization": `Bearer ${UNIVERSAL_KEY}` }
    });

    const ai_response = response.data.choices[0].message.content;

    // 4. Save History
    await db.collection("conversations").insertMany([
      { bot_id: bot._id, external_user_id, role: "user", content: user_message, timestamp: new Date() },
      { bot_id: bot._id, external_user_id, role: "assistant", content: ai_response, timestamp: new Date() }
    ]);

    res.json({ reply: ai_response });

  } catch (err) {
    console.error("AI Error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI processing failed" });
  }
});

export default r;
