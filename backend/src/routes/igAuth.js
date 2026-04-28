import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";

const r = Router();

const CLIENT_ID = process.env.INSTAGRAM_APP_ID || process.env.INSTAGRAM_CLIENT_ID;
const CLIENT_SECRET = process.env.INSTAGRAM_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET;
const REDIRECT_URI = "https://aichataz.onrender.com/api/auth/instagram/callback";
const SCOPE = "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages";

// 1. Start OAuth Flow (Optionally with bot_id in state)
r.get("/start", (req, res) => {
  const { bot_id } = req.query;
  const params = new URLSearchParams({
    enable_fb_login: "0",
    force_authentication: "1",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    state: bot_id || "" // Pass bot_id to link later
  });
  const url = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  res.redirect(url);
});

// 2. OAuth Callback
r.get("/callback", async (req, res) => {
  const { code, state: bot_id } = req.query;
  if (!code) return res.status(400).send("No code provided");

  try {
    const tokenRes = await axios.post(`https://api.instagram.com/oauth/access_token`, new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code
    }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const access_token = tokenRes.data.access_token;
    const ig_user_id = tokenRes.data.user_id;

    // Link to Bot in DB if bot_id is provided
    if (bot_id && bot_id !== "undefined") {
      const db = getDB();
      await db.collection("bots").updateOne(
        { _id: new ObjectId(bot_id) },
        { 
          : { 
            ig_access_token: access_token, 
            ig_user_id: ig_user_id,
            ig_connected: true,
            updated_at: new Date()
          } 
        }
      );
    }

    // Secure Response: Don't show token
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8fafc;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h1 style="color: #4f46e5;">✅ Instagram Uğurla Qoşuldu!</h1>
            <p style="color: #64748b;">Bu pəncərəni bağlaya və panelə qayıda bilərsiniz.</p>
            <button onclick="window.close()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #4f46e5; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Bağla</button>
          </div>
          <script>setTimeout(() => { window.location.href = "https://aioperator.social"; }, 3000);</script>
        </body>
      </html>
    `);

  } catch (err) {
    console.error("IG OAuth Error:", err.response?.data || err.message);
    res.status(500).send("Authentication failed");
  }
});

export default r;
