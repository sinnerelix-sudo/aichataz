import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import botRoutes from "./routes/bots.js";
import aiRoutes from "./routes/ai.js";
import webhookRoutes from "./routes/webhook.js";
import igAuthRoutes from "./routes/igAuth.js";
import paymentRoutes from "./routes/payment.js";

console.log("🚀 Initializing AI Operator Backend (2026 Standards)...");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: ["https://www.aioperator.social", "https://aioperator.social", "http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bots", botRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/auth/instagram", igAuthRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => res.json({ ok: true, project: "AI Operator API" }));
app.get("/api/health", (req, res) => res.json({ status: "healthy" }));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server listening on :${PORT}`));
}).catch(err => {
  console.error("❌ Failed to start server", err);
  process.exit(1);
});
