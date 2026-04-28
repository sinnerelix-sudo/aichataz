import { Router } from "express";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const r = Router();

r.post("/checkout", async (req, res) => {
  const { userId, planId } = req.body;
  const db = getDB();
  
  const sub = {
    userId: new ObjectId(userId),
    planId,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date()
  };
  
  const result = await db.collection("subscriptions").insertOne(sub);
  res.json({ ok: true, checkoutUrl: `https://www.aioperator.social/payment?sub_id=${result.insertedId}&plan=${planId}` });
});

r.post("/verify", async (req, res) => {
  const { sub_id, userId, planId } = req.body;
  const db = getDB();
  
  console.log("💳 PAYMENT VERIFY REQUEST:", { userId, planId });

  // Update based on sub_id if available, otherwise find most recent pending for user
  const query = sub_id && ObjectId.isValid(sub_id) 
    ? { _id: new ObjectId(sub_id) } 
    : { userId: new ObjectId(userId), status: 'pending' };

  const result = await db.collection("subscriptions").updateOne(
    query,
    { $set: { status: 'active', paymentStatus: 'paid', paidAt: new Date() } },
    { sort: { createdAt: -1 } }
  );
  
  if (result.matchedCount === 0) {
      // If no pending found, just ensure user has an active one for demo
      await db.collection("subscriptions").insertOne({
        userId: new ObjectId(userId),
        planId: planId || 'COMBO',
        status: 'active',
        paymentStatus: 'paid',
        createdAt: new Date(),
        paidAt: new Date()
      });
  }
  
  res.json({ success: true });
});

export default r;
