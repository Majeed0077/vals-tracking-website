import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI");
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // Allow global `mongoose` to exist
  // This avoids TypeScript "any" errors
  // and supports Next.js hot reload
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB(): Promise<Mongoose> {
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
