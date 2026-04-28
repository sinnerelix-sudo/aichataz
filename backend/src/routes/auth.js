import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";
import { PLANS } from "../plans.js";

const r = Router();
const JWT_SECRET = process.env.JWT_SECRET || "aioperator_secret_jwt_2026";
const PAYMENT_ENABLED = process.env.PAYMENT_ENABLED === 'true'; // Default is false for MVP

r.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, name, surname, email, password, phone, plan } = req.body;
    const finalFirstName = firstName || name;
    const finalLastName = lastName || surname;
    const finalPlan = plan || req.body.selectedPlan;

    console.log("🚀 [REGISTER ATTEMPT]:", { email, phone, plan: finalPlan });

    if (!email || !password || !phone || !finalPlan) {
      return res.status(400).json({ success: false, error: "Bütün xanaları doldurun." });
    }

    const db = getDB();
    const exists = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, error: "Bu email artıq qeydiyyatdan keçib. Giriş edin.", code: "EMAIL_EXISTS" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userDoc = {
      firstName: finalFirstName, lastName: finalLastName,
      email: email.toLowerCase(), password: hashedPassword,
      phone, createdAt: new Date()
    };

    const result = await db.collection("users").insertOne(userDoc);
    const userId = result.insertedId;

    const planMap = { 'INSTAGRAM': 'instagram_pkg', 'WHATSAPP': 'whatsapp_pkg', 'COMBO': 'combo_pkg', 'MULTI_PANEL': 'multi_pkg' };
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
      productLimit: planConfig?.productLimit || 100,
      createdAt: new Date(),
      paidAt: new Date()
    };
    await db.collection("subscriptions").insertOne(subDoc);

    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

    console.log("✅ [REGISTER SUCCESS]: User and Subscription created for", email);

    res.json({
      success: true,
      token,
      user: { id: userId, firstName: finalFirstName, lastName: finalLastName, email: email.toLowerCase() },
      subscription: subDoc,
      redirectTo: "/dashboard?registered=true"
    });

  } catch (error) {
    console.error("🔥 [REGISTER ERROR]:", error);
    res.status(500).json({ success: false, error: "Server xətası" });
  }
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  console.log("🚀 [LOGIN ATTEMPT]:", email);

  try {
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (!user) {
        console.warn("❌ [LOGIN FAILED]: User not found", email);
        return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        console.warn("❌ [LOGIN FAILED]: Wrong password", email);
        return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });
    }

    // IMPORTANT: Fetch latest subscription
    let subscription = await db.collection("subscriptions").findOne(
        { userId: user._id },
        { sort: { createdAt: -1 } }
    );

    // MVP Logic: If no sub exists but user is registered, create a default one to prevent lock-out
    if (!subscription && !PAYMENT_ENABLED) {
        console.log("🛠 [LOGIN]: No sub found for existing user. Auto-creating default for MVP.");
        subscription = {
            userId: user._id,
            planId: 'combo_pkg',
            planType: 'COMBO',
            status: 'active',
            paymentStatus: 'paid',
            botLimit: 1,
            createdAt: new Date(),
            paidAt: new Date()
        };
        await db.collection("subscriptions").insertOne(subscription);
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log("✅ [LOGIN SUCCESS]: User", email, "| Sub Status:", subscription?.status);

    res.json({ 
        success: true, 
        token, 
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
        subscription,
        redirectTo: "/dashboard"
    });

  } catch (err) {
    console.error("🔥 [LOGIN ERROR]:", err);
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
        
        const subscription = await db.collection("subscriptions").findOne(
            { userId: user._id },
            { sort: { createdAt: -1 } }
        );
        
        res.json({ 
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone },
            subscription 
        });
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
});

export default r;
