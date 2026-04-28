import { Router } from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const r = Router();

r.post("/checkout", async (req, res) => {
  const { userId, planId } = req.body;
  const db = getDB();
  
  // Create pending subscription
  const sub = {
    userId: new ObjectId(userId),
    planId,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date()
  };
  
  const result = await db.collection("subscriptions").insertOne(sub);
  res.json({ ok: true, checkoutUrl: `https://www.aioperator.social/payment/mock?sub_id=${result.insertedId}` });
});

r.post("/verify", async (req, res) => {
  const { sub_id } = req.body;
  const db = getDB();
  
  // Mock verify: Always success for now
  await db.collection("subscriptions").updateOne(
    { _id: new ObjectId(sub_id) },
    { $set: { status: 'active', paymentStatus: 'paid', paidAt: new Date() } }
  );
  
  res.json({ success: true });
});

export default r;
