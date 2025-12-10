import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache || {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cached;

export async function connectDB(): Promise<Mongoose> {
  // Runtime check – only fails when we actually try to connect
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Optional logs – fine in dev, you can wrap in NODE_ENV check later
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
