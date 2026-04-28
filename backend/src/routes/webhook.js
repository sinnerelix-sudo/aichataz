import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";
import { decrypt } from "../util.js";

const r = Router();

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const UNIVERSAL_KEY = process.env.UNIVERSAL_KEY;
const LLM_BASE_URL = "https://integrations.emergentagent.com/llm/v1/chat/completions";

async function sendIGMessage(senderId, text, accessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`, {
      recipient: { id: senderId },
      message: { text: text }
    });
    console.log(`✅ [IG SEND] Sent to ${senderId}`);
  } catch (err) {
    console.error("❌ [IG SEND] Failed:", err.response?.data || err.message);
  }
}

r.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) return res.status(200).send(challenge);
  res.sendStatus(403);
});

r.post("/", async (req, res) => {
  console.log("🔥 [WEBHOOK] Incoming Event:", JSON.stringify(req.body, null, 2));
  const body = req.body;
  const db = getDB();

  if (body.object === "instagram") {
    for (const entry of body.entry) {
      // 1. Messaging (DMs)
      if (entry.messaging) {
        for (const messaging of entry.messaging) {
            const sender_id = messaging.sender.id;
            const recipient_id = messaging.recipient.id; // Page/User ID
            const text = messaging.message?.text;

            if (text) {
                // Find Bot linked to this IG Account
                const bot = await db.collection("bots").findOne({ ig_user_id: recipient_id });
                if (bot && bot.is_active && bot.ig_access_token) {
                    try {
                        // Get Products for Knowledge
                        const products = await db.collection("products").find({ botId: bot._id }).toArray();
                        const productContext = products.map(p => `${p.name}: ${p.price} AZN. ${p.description}`).join("\n");

                        const history = await db.collection("conversations")
                            .find({ bot_id: bot._id, external_user_id: sender_id })
                            .sort({ timestamp: 1 }).limit(10).toArray();

                        const messages = [
                            { role: "system", content: `${bot.prompt}\n\nSTOK VƏ QİYMƏTLƏR:\n${productContext}` },
                            ...history.map(h => ({ role: h.role, content: h.content })),
                            { role: "user", content: text }
                        ];

                        const ai_res = await axios.post(LLM_BASE_URL, {
                            model: "google/gemini-2.0-flash",
                            messages: messages
                        }, { headers: { "Authorization": `Bearer ${UNIVERSAL_KEY}` } });

                        const reply = ai_res.data.choices[0].message.content;
                        const token = decrypt(bot.ig_access_token);

                        await sendIGMessage(sender_id, reply, token);

                        // Logs and History
                        await db.collection("logs").insertOne({ bot_id: bot._id, type: "message", from: sender_id, content: text, reply: reply, timestamp: new Date() });
                        await db.collection("conversations").insertMany([
                            { bot_id: bot._id, external_user_id: sender_id, role: "user", content: text, timestamp: new Date() },
                            { bot_id: bot._id, external_user_id: sender_id, role: "assistant", content: reply, timestamp: new Date() }
                        ]);
                    } catch (err) { console.error("❌ AI Error:", err.message); }
                }
            }
        }
      }
      // 2. Changes (Comments) - logic would be similar...
    }
  }
  res.status(200).send("EVENT_RECEIVED");
});

export default r;
