import { Router } from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";
import { PLANS } from "../plans.js";

const r = Router();

r.get("/", async (req, res) => {
  const { userId } = req.query;
  const db = getDB();
  const bots = await db.collection("bots").find({ ownerId: new ObjectId(userId) }).toArray();
  res.json(bots);
});

r.post("/", async (req, res) => {
  const { name, niche, prompt, knowledge_base, userId, style, greeting, discount_rules, human_handoff } = req.body;
  const db = getDB();
  const sub = await db.collection("subscriptions").findOne({ userId: new ObjectId(userId), status: 'active' });
  if (!sub) return res.status(403).json({ error: "Abunəlik tapılmadı." });

  const plan = Object.values(PLANS).find(p => p.id === sub.planId);
  const count = await db.collection("bots").countDocuments({ ownerId: new ObjectId(userId) });
  if (count >= plan.botLimit) return res.status(403).json({ error: "Bot limiti dolub." });

  const bot = { 
    name, niche, prompt, knowledge_base, style, greeting, discount_rules, human_handoff,
    ownerId: new ObjectId(userId), createdAt: new Date(), ig_connected: false, is_active: true 
  };
  const result = await db.collection("bots").insertOne(bot);
  res.json({ ok: true, id: result.insertedId });
});

r.get("/logs", async (req, res) => {
  const { userId } = req.query;
  const db = getDB();
  const bots = await db.collection("bots").find({ ownerId: new ObjectId(userId) }).project({_id: 1}).toArray();
  const logs = await db.collection("logs").find({ bot_id: { $in: bots.map(b => b._id) } }).sort({ timestamp: -1 }).limit(50).toArray();
  res.json(logs);
});

r.get("/debug/all", async (req, res) => {
  const bots = await getDB().collection("bots").find().toArray();
  res.json(bots.map(b => ({
      botId: b._id, botName: b.name, instagramConnected: b.ig_connected || b.instagramConnected || false,
      instagramUserId: b.ig_user_id || b.instagramUserId || null,
      hasToken: !!(b.ig_access_token || b.encryptedInstagramToken)
  })));
});

export default r;
