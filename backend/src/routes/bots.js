import { Router } from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const r = Router();

r.post("/", async (req, res) => {
  const { name, niche, prompt, knowledge_base, owner_id } = req.body;
  const db = getDB();
  const bot = { name, niche, prompt, knowledge_base, owner_id: owner_id ? new ObjectId(owner_id) : null, ig_user_id: null, ig_connected: false, is_active: true, created_at: new Date() };
  const result = await db.collection("bots").insertOne(bot);
  res.json({ ok: true, id: result.insertedId });
});

r.get("/", async (req, res) => {
  const db = getDB();
  const bots = await db.collection("bots").find().toArray();
  res.json(bots);
});

r.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { prompt, knowledge_base, is_active } = req.body;
    const db = getDB();
    await db.collection("bots").updateOne(
        { _id: new ObjectId(id) },
        { $set: { prompt, knowledge_base, is_active, updated_at: new Date() } }
    );
    res.json({ ok: true });
});

r.get("/logs", async (req, res) => {
  const db = getDB();
  const logs = await db.collection("logs").find().sort({ timestamp: -1 }).limit(50).toArray();
  res.json(logs);
});

export default r;
