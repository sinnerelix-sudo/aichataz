import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";
import { PLANS } from "../plans.js";

const r = Router();
const JWT_SECRET = process.env.JWT_SECRET || "aioperator_secret_jwt_2026";

r.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, name, surname, email, password, phone, plan } = req.body;
    const finalFirstName = firstName || name;
    const finalLastName = lastName || surname;
    const finalPlan = plan || req.body.selectedPlan;

    if (!email || !password || !phone || !finalPlan) {
      return res.status(400).json({ success: false, error: "Bütün xanaları doldurun." });
    }

    const db = getDB();
    const exists = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ 
        success: false, 
        error: "Bu email artıq qeydiyyatdan keçib. Giriş edin.",
        code: "EMAIL_EXISTS"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userDoc = {
      firstName: finalFirstName,
      lastName: finalLastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      isPhoneVerified: false,
      createdAt: new Date()
    };

    const result = await db.collection("users").insertOne(userDoc);
    const userId = result.insertedId;

    const planMap = {
        'INSTAGRAM': 'instagram_pkg',
        'WHATSAPP': 'whatsapp_pkg',
        'COMBO': 'combo_pkg',
        'MULTI_PANEL': 'multi_pkg'
    };
    const planId = planMap[finalPlan] || finalPlan;
    const planConfig = Object.values(PLANS).find(p => p.id === planId);

    // MVP AUTO-ACTIVATE
    const subDoc = {
      userId: userId,
      planId: planConfig?.id || 'combo_pkg',
      planType: finalPlan,
      status: 'active',
      paymentStatus: 'paid',
      botLimit: planConfig?.botLimit || 1,
      createdAt: new Date(),
      paidAt: new Date()
    };
    await db.collection("subscriptions").insertOne(subDoc);

    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: userId, firstName: finalFirstName, lastName: finalLastName, email: email.toLowerCase() },
      subscription: subDoc,
      redirectTo: "/dashboard?registered=true"
    });

  } catch (error) {
    console.error("🔥 REGISTER ERROR:", error);
    res.status(500).json({ success: false, error: "Server xətası" });
  }
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  try {
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
        ok: true, 
        token, 
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } 
    });
  } catch (err) {
    res.status(500).json({ error: "Giriş zamanı xəta" });
  }
});

r.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = getDB();
        const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
        if (!user) return res.status(404).json({ error: "User not found" });
        
        const sub = await db.collection("subscriptions").findOne(
            { userId: user._id, status: 'active' },
            { sort: { createdAt: -1 } }
        );
        
        res.json({ ...user, subscription: sub });
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
});

export default r;
