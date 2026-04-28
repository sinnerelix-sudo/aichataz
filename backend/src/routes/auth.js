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
    
    // Normalize field names (accept both old and new style)
    const finalFirstName = firstName || name;
    const finalLastName = lastName || surname;
    const finalPlan = plan || req.body.selectedPlan;

    console.log("🚀 REGISTER REQUEST:", { 
        firstName: finalFirstName, 
        lastName: finalLastName, 
        email, 
        phone, 
        plan: finalPlan 
    });

    if (!email || !password || !phone || !finalPlan) {
      return res.status(400).json({ error: "Bütün xanaları doldurun. Tarif seçildiyindən əmin olun." });
    }

    const db = getDB();
    const exists = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Bu email artıq qeydiyyatdan keçib" });

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

    // Map plan string to ID from plans.js if needed, or use directly
    // User wants: INSTAGRAM, WHATSAPP, COMBO, MULTI_PANEL
    // Our plans.js has: instagram_pkg, whatsapp_pkg, combo_pkg, multi_pkg
    const planMap = {
        'INSTAGRAM': 'instagram_pkg',
        'WHATSAPP': 'whatsapp_pkg',
        'COMBO': 'combo_pkg',
        'MULTI_PANEL': 'multi_pkg'
    };
    
    const planId = planMap[finalPlan] || finalPlan;
    const planConfig = Object.values(PLANS).find(p => p.id === planId);

    if (!planConfig) {
        console.error("❌ Invalid Plan:", finalPlan);
        return res.status(400).json({ error: "Yanlış tarif seçimi." });
    }

    // Create pending subscription
    await db.collection("subscriptions").insertOne({
      userId: userId,
      planId: planConfig.id,
      status: 'pending',
      paymentStatus: 'pending',
      botLimit: planConfig.botLimit,
      productLimit: planConfig.productLimit,
      createdAt: new Date()
    });

    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ ok: true, token, userId });

  } catch (error) {
    console.error("🔥 REGISTER ERROR:", error);
    res.status(500).json({ error: "Server xətası, yenidən cəhd edin" });
  }
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  const user = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ ok: true, token, user: { id: user._id, name: user.firstName || user.name, email: user.email } });
});

r.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = getDB();
        const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
        if (!user) throw new Error("User not found");
        
        // Find latest active or pending sub
        const sub = await db.collection("subscriptions").findOne(
            { userId: user._id },
            { sort: { createdAt: -1 } }
        );
        
        res.json({ ...user, subscription: sub });
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
});

export default r;
