import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";

const r = Router();

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = "https://aichataz.onrender.com/api/auth/instagram/callback";

// 1. Start OAuth Flow
r.get("/start", (req, res) => {
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=instagram_basic,instagram_manage_messages,pages_manage_metadata,pages_show_list,business_management`;
  res.redirect(url);
});

// 2. OAuth Callback
r.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");

  try {
    // Exchange code for Short-Lived User Access Token
    const tokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        client_id: APP_ID,
        client_secret: APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      }
    });

    const userAccessToken = tokenRes.data.access_token;

    // TODO: In a real app, you would exchange this for a LONG-LIVED token
    // and then find the Instagram Page ID associated with the user's pages.
    
    // For now, we return the token (in production, save to DB linked to user)
    res.json({
      message: "Instagram connected successfully!",
      access_token: userAccessToken,
      note: "Məlumatlar bazaya yadda saxlanılmalıdır."
    });

  } catch (err) {
    console.error("IG OAuth Error:", err.response?.data || err.message);
    res.status(500).send("Authentication failed");
  }
});

export default r;
