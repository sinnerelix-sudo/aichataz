import { Router } from "express";
import axios from "axios";
import { getDB } from "../db.js";
import { ObjectId } from "mongodb";
import { encrypt } from "../util.js";

const r = Router();

const CLIENT_ID = process.env.INSTAGRAM_APP_ID || "26461530366882280";
const CLIENT_SECRET = process.env.INSTAGRAM_APP_SECRET;
const REDIRECT_URI = "https://aichataz.onrender.com/api/auth/instagram/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.aioperator.social";
const SCOPE = "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages";

// 1. Start OAuth Flow
r.get("/start", (req, res) => {
  const { bot_id } = req.query;
  if (!bot_id) return res.status(400).send("bot_id is required");

  // Encode bot_id into state as base64url for mobile stability
  const state = Buffer.from(JSON.stringify({ bot_id })).toString("base64url");

  const params = new URLSearchParams({
    enable_fb_login: "0",
    force_authentication: "1",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    state: state
  });

  const url = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  console.log("🚀 Starting Instagram OAuth for bot:", bot_id);
  res.redirect(url);
});

// 2. OAuth Callback
r.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/dashboard?instagram=error&reason=no_code`);
  }

  let bot_id;
  try {
    const decodedState = JSON.parse(Buffer.from(state, 'base64url').toString());
    bot_id = decodedState.bot_id;
  } catch (err) {
    console.error("❌ Failed to decode state:", err.message);
    return res.redirect(`${FRONTEND_URL}/dashboard?instagram=error&reason=invalid_state`);
  }

  try {
    // Exchange code for Instagram Access Token
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

    if (bot_id) {
      const db = getDB();
      // Update bot with connection details
      await db.collection("bots").updateOne(
        { _id: new ObjectId(bot_id) },
        { 
          $set: { 
            ig_access_token: encrypt(access_token), 
            ig_user_id: ig_user_id,
            ig_connected: true,
            ig_connected_at: new Date(),
            updated_at: new Date()
          } 
        }
      );
      console.log(`✅ Bot ${bot_id} linked to IG User ${ig_user_id}`);
      return res.redirect(`${FRONTEND_URL}/dashboard?instagram=connected&bot_id=${bot_id}`);
    }

    return res.redirect(`${FRONTEND_URL}/dashboard?instagram=error`);

  } catch (err) {
    console.error("❌ Instagram Callback Error:", err.response?.data || err.message);
    return res.redirect(`${FRONTEND_URL}/dashboard?instagram=error`);
  }
});

export default r;
