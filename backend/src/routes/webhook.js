import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";

const r = Router();

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const UNIVERSAL_KEY = process.env.UNIVERSAL_KEY;
const LLM_BASE_URL = "https://integrations.emergentagent.com/llm/v1/chat/completions";

// 1. Webhook Verification
r.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. Event Handling
r.post("/", async (req, res) => {
  const body = req.body;
  const db = getDB();

  if (body.object === "instagram") {
    for (const entry of body.entry) {
      // Handle Messages
      if (entry.messaging) {
        const messaging = entry.messaging[0];
        const sender_id = messaging.sender.id;
        const recipient_id = messaging.recipient.id;
        const text = messaging.message?.text;

        if (text) {
          const bot = await db.collection("bots").findOne({ ig_user_id: recipient_id });
          if (bot && bot.is_active) {
            // Process and save log
            await db.collection("logs").insertOne({
                bot_id: bot._id,
                type: "message",
                from: sender_id,
                content: text,
                timestamp: new Date()
            });
            // AI Response logic here...
          }
        }
      }

      // Handle Comments
      if (entry.changes) {
        for (const change of entry.changes) {
            if (change.field === "comments") {
                const comment = change.value;
                const bot = await db.collection("bots").findOne({ ig_user_id: entry.id });
                
                if (bot) {
                    await db.collection("logs").insertOne({
                        bot_id: bot._id,
                        type: "comment",
                        from: comment.from.username,
                        content: comment.text,
                        post_id: comment.media.id,
                        timestamp: new Date()
                    });
                    console.log(`💬 New comment on post ${comment.media.id}: ${comment.text}`);
                }
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
