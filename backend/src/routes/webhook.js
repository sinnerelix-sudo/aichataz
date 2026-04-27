import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";

const r = Router();

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const UNIVERSAL_KEY = process.env.UNIVERSAL_KEY;
const LLM_BASE_URL = "https://integrations.emergentagent.com/llm/v1/chat/completions";

// 1. Webhook Verification (GET)
r.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook Verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. Message Handling (POST)
r.post("/", async (req, res) => {
  const body = req.body;

  if (body.object === "instagram") {
    for (const entry of body.entry) {
      const messaging = entry.messaging[0];
      const sender_id = messaging.sender.id;
      const recipient_id = messaging.recipient.id; // This is the Page ID
      const message_text = messaging.message?.text;

      if (message_text) {
        console.log(`📩 New IG Message from ${sender_id}: ${message_text}`);
        
        // Find Bot by Page ID
        const db = getDB();
        const bot = await db.collection("bots").findOne({ instagram_page_id: recipient_id });

        if (bot && bot.is_active) {
            // Process with AI and Reply
            try {
                // (Logic similar to ai.js /chat route)
                // 1. Fetch History
                const history = await db.collection("conversations")
                    .find({ bot_id: bot._id, external_user_id: sender_id })
                    .sort({ timestamp: 1 })
                    .limit(5)
                    .toArray();

                const messages = [
                    { role: "system", content: `${bot.prompt}\n\nKNOWLEDGE BASE:\n${bot.knowledge_base}` },
                    ...history.map(h => ({ role: h.role, content: h.content })),
                    { role: "user", content: message_text }
                ];

                // 2. Call Gemini
                const ai_res = await axios.post(LLM_BASE_URL, {
                    model: "google/gemini-2.0-flash",
                    messages: messages
                }, {
                    headers: { "Authorization": `Bearer ${UNIVERSAL_KEY}` }
                });

                const reply_text = ai_res.data.choices[0].message.content;

                // 3. Send back to IG (Requires Page Access Token)
                // (This part needs a stored token for each bot or a global one)
                // For now, we log it.
                console.log(`🤖 AI Reply: ${reply_text}`);
                
                // Save to DB
                await db.collection("conversations").insertMany([
                    { bot_id: bot._id, external_user_id: sender_id, role: "user", content: message_text, timestamp: new Date() },
                    { bot_id: bot._id, external_user_id: sender_id, role: "assistant", content: reply_text, timestamp: new Date() }
                ]);

            } catch (err) {
                console.error("AI/IG Error:", err.message);
            }
        }
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

export default r;
