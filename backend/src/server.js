console.log("🚀 Initializing Backend Server...");
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import botRoutes from "./routes/bots.js";
import aiRoutes from "./routes/ai.js";
import igAuthRoutes from "./routes/igAuth.js";
import webhookRoutes from "./routes/webhook.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use("/api/bots", botRoutes);
app.use("/api/auth/instagram", igAuthRoutes);
app.get("/api/debug/instagram-oauth-url", (req, res) => res.redirect("/api/auth/instagram/debug/url"));
app.use("/api/webhook", webhookRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.json({ ok: true, project: "AIChatAz API" }));
app.get("/api/health", (req, res) => res.json({ status: "healthy" }));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server listening on :${PORT}`));
}).catch(err => {
  console.error("Failed to start server", err);
  process.exit(1);
});
