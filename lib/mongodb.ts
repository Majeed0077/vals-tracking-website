// lib/mongodb.ts
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.warn(
    "MONGODB_URI is not set. Database connections will fail at runtime."
  );
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache || {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cached;

export async function connectDB(): Promise<Mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in environment variables.");
  }

  // Already connected
  if (cached.conn) {
    return cached.conn;
  }

  // Start connection promise once
  if (!cached.promise) {
    console.log("CONNECTING TO DATABASE...");

    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongooseInstance) => {
        console.log("CONNECTED DB NAME:", mongooseInstance.connection.name);
        console.log("CONNECTED HOST:", mongooseInstance.connection.host);
        return mongooseInstance;
      })
      .catch((err) => {
        // If connection fails, reset promise so next call can retry
        cached.promise = null;
        console.error("MONGODB CONNECTION ERROR:", err);
        throw err;
      });
  }

  // Here TypeScript knows cached.promise is not null
  const db = await cached.promise;
  cached.conn = db;
  return db;
}
