import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";
import { decrypt } from "../util.js";

const r = Router();

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const UNIVERSAL_KEY = process.env.UNIVERSAL_KEY;
const LLM_BASE_URL = "https://integrations.emergentagent.com/llm/v1/chat/completions";

async function sendIGMessage(recipientId, text, accessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`, {
      recipient: { id: recipientId },
      message: { text: text }
    });
    console.log(`✅ Sent IG message to ${recipientId}`);
  } catch (err) {
    console.error("❌ Failed to send IG message:", err.response?.data || err.message);
  }
}

r.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) res.status(200).send(challenge);
  else res.sendStatus(403);
});

r.post("/", async (req, res) => {
  const body = req.body;
  const db = getDB();

  if (body.object === "instagram") {
    for (const entry of body.entry) {
      if (entry.messaging) {
        const messaging = entry.messaging[0];
        const sender_id = messaging.sender.id;
        const recipient_id = messaging.recipient.id;
        const text = messaging.message?.text;

        if (text) {
          const bot = await db.collection("bots").findOne({ ig_user_id: recipient_id });
          if (bot && bot.is_active && bot.ig_access_token) {
            try {
                const history = await db.collection("conversations")
                    .find({ bot_id: bot._id, external_user_id: sender_id })
                    .sort({ timestamp: 1 }).limit(5).toArray();

                const messages = [
                    { role: "system", content: `${bot.prompt}\n\nKNOWLEDGE BASE:\n${bot.knowledge_base}` },
                    ...history.map(h => ({ role: h.role, content: h.content })),
                    { role: "user", content: text }
                ];

                const ai_res = await axios.post(LLM_BASE_URL, {
                    model: "google/gemini-2.0-flash",
                    messages: messages
                }, { headers: { "Authorization": `Bearer ${UNIVERSAL_KEY}` } });

                const reply_text = ai_res.data.choices[0].message.content;
                const decryptedToken = decrypt(bot.ig_access_token);

                await sendIGMessage(sender_id, reply_text, decryptedToken);

                await db.collection("logs").insertOne({ bot_id: bot._id, type: "message", from: sender_id, content: text, timestamp: new Date() });
                await db.collection("conversations").insertMany([
                    { bot_id: bot._id, external_user_id: sender_id, role: "user", content: text, timestamp: new Date() },
                    { bot_id: bot._id, external_user_id: sender_id, role: "assistant", content: reply_text, timestamp: new Date() }
                ]);
            } catch (err) { console.error("AI/IG Webhook Error:", err.message); }
          }
        }
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else res.sendStatus(404);
});

export default r;
