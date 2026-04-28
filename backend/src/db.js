import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "aichataz_db";

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
  console.log("✅ MongoDB Connected Successfully");
  
  // Indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("subscriptions").createIndex({ userId: 1 });
  await db.collection("bots").createIndex({ ownerId: 1 });
  await db.collection("products").createIndex({ botId: 1 });
  await db.collection("logs").createIndex({ bot_id: 1, timestamp: -1 });
  
  return db;
}

export function getDB() {
  if (!db) throw new Error("DB not connected");
  return db;
}
