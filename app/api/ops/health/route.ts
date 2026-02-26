import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let dbStatus: "up" | "down" = "down";
  let dbError: string | undefined;

  try {
    await connectDB();
    dbStatus = mongoose.connection.readyState === 1 ? "up" : "down";
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Database error";
  }

  const uptimeSeconds = Math.floor(process.uptime());
  const durationMs = Date.now() - startedAt;

  const payload = {
    success: dbStatus === "up",
    service: "valstracking-api",
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    durationMs,
    checks: {
      db: {
        status: dbStatus,
        ...(dbError ? { error: dbError } : {}),
      },
    },
  };

  return NextResponse.json(payload, {
    status: dbStatus === "up" ? 200 : 503,
  });
}
