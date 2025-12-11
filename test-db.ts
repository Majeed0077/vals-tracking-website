// test-db.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // <-- IMPORTANT: .env.local explicitly

import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "";

async function main() {
  console.log("MONGODB_URI from env:", uri ? "LOADED" : "MISSING");

  if (!uri) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  try {
    console.log("Connecting to Mongo...");
    const conn = await mongoose.connect(uri);
    console.log("Connected to DB:", conn.connection.name);
    console.log("Host:", conn.connection.host);
    await mongoose.disconnect();
    console.log("Disconnected. SUCCESS.");
  } catch (err) {
    console.error("TEST CONNECTION ERROR:", err);
  }
}

main();
