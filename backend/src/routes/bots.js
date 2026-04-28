import { Router } from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";
import { PLANS } from "../plans.js";
import { ensureActiveSubscription } from "./auth.js";

const r = Router();

r.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId || userId === 'null' || userId === 'undefined') return res.json([]);
  const db = getDB();
  const bots = await db.collection("bots").find({ ownerId: new ObjectId(userId) }).toArray();
  res.json(bots);
});

r.post("/", async (req, res) => {
  const { name, niche, prompt, knowledge_base, userId } = req.body;
  if (!userId) return res.status(401).json({ error: "İstifadəçi tapılmadı. Yenidən giriş edin." });
  
  const db = getDB();
  try {
    const sub = await ensureActiveSubscription(userId);
    const plan = Object.values(PLANS).find(p => p.id === sub.planId) || PLANS.COMBO;
    const count = await db.collection("bots").countDocuments({ ownerId: new ObjectId(userId) });

    if (count >= plan.botLimit) {
      return res.status(403).json({ 
        error: `Paket limiti dolub. Ən çox ${plan.botLimit} bot yarada bilərsiniz.`,
        code: "LIMIT_REACHED"
      });
    }

    const bot = { 
      name, niche, prompt, knowledge_base, ownerId: new ObjectId(userId), 
      createdAt: new Date(), ig_connected: false, is_active: true 
    };
    await db.collection("bots").insertOne(bot);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Bot yaradılanda server xətası baş verdi." });
  }
});

r.get("/logs", async (req, res) => {
  const { userId } = req.query;
  if (!userId || userId === 'null') return res.json([]);
  const db = getDB();
  const bots = await db.collection("bots").find({ ownerId: new ObjectId(userId) }).project({_id: 1}).toArray();
  const botIds = bots.map(b => b._id);
  const logs = await db.collection("logs").find({ bot_id: { $in: botIds } }).sort({ timestamp: -1 }).limit(50).toArray();
  res.json(logs);
});

export default r;
