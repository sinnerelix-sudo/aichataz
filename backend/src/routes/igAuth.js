import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";

const r = Router();

// Using Instagram-specific credentials as requested
const CLIENT_ID = process.env.INSTAGRAM_APP_ID || process.env.INSTAGRAM_CLIENT_ID;
const CLIENT_SECRET = process.env.INSTAGRAM_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET;
const REDIRECT_URI = "https://aichataz.onrender.com/api/auth/instagram/callback";
const SCOPE = "instagram_business_basic,instagram_manage_comments,instagram_business_manage_messages";

// Helper to generate the URL
const generateAuthUrl = () => {
  return `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPE)}`;
};

// 1. Start OAuth Flow for Instagram
r.get("/start", (req, res) => {
  const url = generateAuthUrl();
  console.log("🚀 Generated Instagram OAuth URL:", url);
  res.redirect(url);
});

// 2. Debug Endpoint
r.get("/debug/url", (req, res) => {
  res.json({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    authorize_url: generateAuthUrl()
  });
});

// 3. OAuth Callback
r.get("/callback", async (req, res) => {
  const { code } = req.query;
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

    const userAccessToken = tokenRes.data.access_token;
    const userId = tokenRes.data.user_id;

    res.json({
      message: "Instagram connected successfully!",
      access_token: userAccessToken,
      user_id: userId
    });

  } catch (err) {
    console.error("IG OAuth Error:", err.response?.data || err.message);
    res.status(500).send("Authentication failed");
  }
});

export default r;
