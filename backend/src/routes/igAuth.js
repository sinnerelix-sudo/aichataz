import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";
import crypto from "crypto";

const r = Router();

const CLIENT_ID = process.env.INSTAGRAM_APP_ID || process.env.INSTAGRAM_CLIENT_ID;
const CLIENT_SECRET = process.env.INSTAGRAM_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET;
const REDIRECT_URI = "https://aichataz.onrender.com/api/auth/instagram/callback";
const SCOPE = "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages";

// Simple Encryption Setup
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "a_very_secret_key_32_chars_long!!"; // Should be 32 chars
const IV_LENGTH = 16;

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// 1. Start OAuth Flow
r.get("/start", (req, res) => {
  const { bot_id } = req.query;
  const params = new URLSearchParams({
    enable_fb_login: "0",
    force_authentication: "1",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    state: bot_id || ""
  });
  const url = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  res.redirect(url);
});

// 2. OAuth Callback
r.get("/callback", async (req, res) => {
  const { code, state: bot_id } = req.query;
  if (!code) return res.status(400).json({ success: false, message: "No code provided" });

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

    // Encrypt the token before saving
    const encryptedToken = encrypt(access_token);

    if (bot_id && bot_id !== "undefined") {
      const db = getDB();
      await db.collection("bots").updateOne(
        { _id: new ObjectId(bot_id) },
        { 
          : { 
            ig_access_token: encryptedToken, 
            ig_user_id: ig_user_id,
            ig_connected: true,
            updated_at: new Date()
          } 
        }
      );
    }

    // Success JSON Response as requested
    res.json({ 
      success: true, 
      message: "Instagram connected successfully" 
    });

  } catch (err) {
    console.error("IG OAuth Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Authentication failed" });
  }
});

export default r;
