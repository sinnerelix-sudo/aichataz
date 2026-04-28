import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";

const r = Router();

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = "https://aichataz.onrender.com/api/auth/instagram/callback";

// 1. Start OAuth Flow
r.get("/start", (req, res) => {
  const scope = "instagram_business_basic,instagram_manage_comments,instagram_business_manage_messages";
  const url = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}`;
  res.redirect(url);
});

// 2. OAuth Callback
r.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");

  try {
    // Exchange code for Access Token
    // Note: Instagram OAuth exchange endpoint is often different from Facebook
    const tokenRes = await axios.post(`https://api.instagram.com/oauth/access_token`, new URLSearchParams({
      client_id: APP_ID,
      client_secret: APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code
    }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const userAccessToken = tokenRes.data.access_token;
    const userId = tokenRes.data.user_id;

    res.json({
      message: "Instagram connected successfully!",
      access_token: userAccessToken,
      user_id: userId,
      note: "Məlumatlar bazaya yadda saxlanılmalıdır."
    });

  } catch (err) {
    console.error("IG OAuth Error:", err.response?.data || err.message);
    res.status(500).send("Authentication failed: " + (err.response?.data?.error_message || err.message));
  }
});

export default r;
