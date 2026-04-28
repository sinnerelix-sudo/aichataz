import { Router } from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";
import { ensureActiveSubscription } from "./auth.js";

const r = Router();

r.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId || userId === 'null' || userId === 'undefined') return res.json([]);
  const db = getDB();
  try {
    const bots = await db.collection("bots").find({ ownerId: new ObjectId(userId) }).toArray();
    res.json(bots);
  } catch (e) { res.json([]); }
});

r.post("/", async (req, res) => {
  const { name, niche, prompt, knowledge_base, userId } = req.body;
  if (!userId) return res.status(401).json({ error: "Giriş lazımdır." });
  
  try {
    const db = getDB();
    const sub = await ensureActiveSubscription(userId);
    const count = await db.collection("bots").countDocuments({ ownerId: new ObjectId(userId) });

    if (count >= (sub.botLimit || 5)) {
      return res.status(403).json({ error: "Bot limiti dolub. Sınaq mərhələsində maksimum 5 bot mümkündür." });
    }

    const bot = { 
      name, niche, prompt, knowledge_base, ownerId: new ObjectId(userId), 
      createdAt: new Date(), ig_connected: false, is_active: true 
    };
    await db.collection("bots").insertOne(bot);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Bot yaradıla bilmədi." });
  }
});

r.get("/logs", async (req, res) => {
  const { userId } = req.query;
  if (!userId || userId === 'null') return res.json([]);
  const db = getDB();
  try {
    const bots = await db.collection("bots").find({ ownerId: new ObjectId(userId) }).project({_id: 1}).toArray();
    const logs = await db.collection("logs").find({ bot_id: { $in: bots.map(b => b._id) } }).sort({ timestamp: -1 }).limit(20).toArray();
    res.json(logs);
  } catch (e) { res.json([]); }
});

export default r;
