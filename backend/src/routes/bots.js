import { Router } from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";
import { PLANS } from "../plans.js";

const r = Router();

async function getActiveSub(userId) {
    const db = getDB();
    return await db.collection("subscriptions").findOne({ userId: new ObjectId(userId), status: 'active' });
}

r.post("/", async (req, res) => {
  const { name, niche, prompt, knowledge_base, userId } = req.body;
  const db = getDB();
  
  try {
    const sub = await getActiveSub(userId);
    if (!sub) return res.status(403).json({ error: "Aktiv abunəlik tapılmadı. Zəhmət olmasa ödəniş edin." });

    const plan = Object.values(PLANS).find(p => p.id === sub.planId);
    const currentBotCount = await db.collection("bots").countDocuments({ ownerId: new ObjectId(userId) });

    if (currentBotCount >= plan.botLimit) {
      return res.status(403).json({ 
        error: `Paket limiti dolub. Paketiniz yalnız ${plan.botLimit} bot yaratmağa icazə verir. Daha çox bot üçün paketi yüksəldin.`,
        code: "LIMIT_REACHED"
      });
    }

    const bot = { 
      name, niche, prompt, knowledge_base, 
      ownerId: new ObjectId(userId), 
      ig_user_id: null, ig_connected: false, 
      wa_connected: false,
      is_active: true, 
      createdAt: new Date() 
    };
    const result = await db.collection("bots").insertOne(bot);
    res.json({ ok: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Server xətası" });
  }
});

r.get("/", async (req, res) => {
  const { userId } = req.query;
  const db = getDB();
  const bots = await db.collection("bots").find({ ownerId: new ObjectId(userId) }).toArray();
  res.json(bots);
});

r.get("/logs", async (req, res) => {
  const { userId } = req.query;
  const db = getDB();
  const userBots = await db.collection("bots").find({ ownerId: new ObjectId(userId) }).project({_id: 1}).toArray();
  const botIds = userBots.map(b => b._id);
  const logs = await db.collection("logs").find({ bot_id: { $in: botIds } }).sort({ timestamp: -1 }).limit(50).toArray();
  res.json(logs);
});

// DEBUG ENDPOINT (SECURE)
r.get("/debug/all", async (req, res) => {
  const db = getDB();
  const bots = await db.collection("bots").find().toArray();
  const debugInfo = bots.map(bot => ({
      botId: bot._id,
      botName: bot.name,
      instagramConnected: bot.ig_connected || bot.instagramConnected || false,
      instagramUserId: bot.ig_user_id || bot.instagramUserId || null,
      hasEncryptedInstagramToken: Boolean(bot.ig_access_token || bot.encryptedInstagramToken)
  }));
  res.json(debugInfo);
});

export default r;
