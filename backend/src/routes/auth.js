import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const r = Router();
const JWT_SECRET = process.env.JWT_SECRET || "aioperator_secret_jwt_2026";

// Global Trial Helper
export async function ensureActiveSubscription(userId) {
  const db = getDB();
  let subscription = await db.collection("subscriptions").findOne({ userId: new ObjectId(userId) });

  if (!subscription) {
    console.log("🛠 [TRIAL MODE]: Auto-creating active sub for user:", userId);
    subscription = {
      userId: new ObjectId(userId),
      planId: 'combo_pkg',
      planType: 'COMBO',
      status: 'active',
      paymentStatus: 'paid',
      botLimit: 5, // Generous for testing
      productLimit: null, // Unlimited
      startsAt: new Date(),
      createdAt: new Date()
    };
    await db.collection("subscriptions").insertOne(subscription);
  }
  return subscription;
}

r.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, plan } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: "Email və şifrə mütləqdir." });

    const db = getDB();
    const exists = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, error: "Bu email artıq qeydiyyatdan keçib.", code: "EMAIL_EXISTS" });

    const userDoc = {
      firstName: firstName || "İstifadəçi",
      lastName: lastName || "",
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      phone: phone || "",
      createdAt: new Date()
    };
    const result = await db.collection("users").insertOne(userDoc);
    const userId = result.insertedId;

    await ensureActiveSubscription(userId);
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user: { id: userId, email }, redirectTo: "/dashboard?registered=true" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server xətası" });
  }
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  try {
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });
    }
    const subscription = await ensureActiveSubscription(user._id);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
        success: true, 
        token, 
        user: { id: user._id, firstName: user.firstName, email: user.email },
        subscription 
    });
  } catch (err) { res.status(500).json({ error: "Giriş zamanı xəta" }); }
});

r.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Giriş edilməyib" });
    try {
        const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
        const db = getDB();
        const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
        if (!user) return res.status(404).json({ error: "İstifadəçi tapılmadı" });
        const subscription = await ensureActiveSubscription(user._id);
        res.json({ user, subscription });
    } catch (e) { res.status(401).json({ error: "Sessiya bitib" }); }
});

export default r;
