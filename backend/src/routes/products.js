import { Router } from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const r = Router();

r.get("/", async (req, res) => {
    const { botId } = req.query;
    if (!botId) return res.status(400).json({ error: "botId missing" });
    const db = getDB();
    const items = await db.collection("products").find({ botId: new ObjectId(botId) }).toArray();
    res.json(items);
});

r.post("/", async (req, res) => {
    const { botId, name, price, description, stock, category } = req.body;
    const db = getDB();
    const product = {
        botId: new ObjectId(botId),
        name, price, description, stock, category,
        createdAt: new Date()
    };
    const result = await db.collection("products").insertOne(product);
    res.json({ ok: true, id: result.insertedId });
});

r.delete("/:id", async (req, res) => {
    const db = getDB();
    await db.collection("products").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ ok: true });
});

export default r;
