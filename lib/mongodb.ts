// lib/mongodb.ts
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  // This will show in logs if env is missing, but won't crash on import
  console.warn("MONGODB_URI is not set. Database connections will fail at runtime.");
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
    // Fail only when we actually try to connect
    throw new Error("MONGODB_URI is not configured in environment variables.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("CONNECTING TO DATABASE...");

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("CONNECTED DB NAME:", mongooseInstance.connection.name);
        console.log("CONNECTED HOST:", mongooseInstance.connection.host);
        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
