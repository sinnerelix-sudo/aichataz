import { Router } from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const r = Router();

// Create a new bot/niche
r.post("/", async (req, res) => {
  const { name, niche, prompt, knowledge_base, owner_id } = req.body;
  const db = getDB();
  
  const bot = {
    name,
    niche,
    prompt, // The "personality" and rules
    knowledge_base, // Specific products and prices
    owner_id: owner_id ? new ObjectId(owner_id) : null,
    instagram_page_id: req.body.instagram_page_id || null,
    is_active: true,
    created_at: new Date()
  };
  
  const result = await db.collection("bots").insertOne(bot);
  res.json({ ok: true, id: result.insertedId });
});

// Get all bots (Super Admin)
r.get("/", async (req, res) => {
  const db = getDB();
  const bots = await db.collection("bots").find().toArray();
  res.json(bots);
});

export default r;
