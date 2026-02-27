import mongoose from "mongoose";

function buildMongoUri() {
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST;
  const dbName = process.env.DB_NAME || "project_2";

  if (!user || !pass || !host) {
    throw new Error("Missing DB_USER / DB_PASSWORD / DB_HOST in .env.local");
  }

  // สำคัญ: encode password กันอักขระพิเศษพัง URI
  const encPass = encodeURIComponent(pass);

  return `mongodb+srv://${user}:${encPass}@${host}/${dbName}?retryWrites=true&w=majority&appName=vorameth`;
}

const MONGODB_URI = process.env.MONGODB_URI || buildMongoUri();

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
