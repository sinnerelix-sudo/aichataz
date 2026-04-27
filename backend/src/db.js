import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "aichataz";

if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

const client = new MongoClient(uri);
let db;

export async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db(dbName);
  console.log(`✅ MongoDB Connected: ${dbName}`);
  
  // Create Essential Indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("bots").createIndex({ owner_id: 1 });
  await db.collection("conversations").createIndex({ bot_id: 1, external_user_id: 1 });
  
  return db;
}

export function getDB() {
  if (!db) throw new Error("DB not connected");
  return db;
}
