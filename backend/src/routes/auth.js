import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const r = Router();
const JWT_SECRET = process.env.JWT_SECRET || "aioperator_secret_jwt_2026";

r.post("/register", async (req, res) => {
  const { name, surname, email, password, phone, selectedPlan } = req.body;
  if (!email || !password || !phone) return res.status(400).json({ error: "Məlumatlar tam deyil" });

  const db = getDB();
  const exists = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ error: "Bu email artıq qeydiyyatdan keçib" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    name, surname,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone,
    isPhoneVerified: false,
    createdAt: new Date()
  };

  const result = await db.collection("users").insertOne(user);
  const token = jwt.sign({ id: result.insertedId }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ ok: true, token, userId: result.insertedId });
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();
  const user = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Email və ya şifrə yanlışdır" });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ ok: true, token, user: { id: user._id, name: user.name, email: user.email } });
});

r.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = getDB();
        const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
        const sub = await db.collection("subscriptions").findOne({ userId: user._id, status: 'active' });
        res.json({ ...user, subscription: sub });
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
});

export default r;
