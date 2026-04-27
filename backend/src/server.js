import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, project: "AIChatAz API" }));
app.get("/api/health", (req, res) => res.json({ status: "healthy" }));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server listening on :${PORT}`));
}).catch(err => {
  console.error("Failed to start server", err);
  process.exit(1);
});
