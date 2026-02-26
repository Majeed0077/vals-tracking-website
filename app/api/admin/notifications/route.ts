import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import NotificationLog from "@/models/NotificationLog";
import { requireAdmin } from "@/lib/routeAuth";
import { notify } from "@/lib/notifications";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();

    const channel = String(req.nextUrl.searchParams.get("channel") || "").trim();
    const status = String(req.nextUrl.searchParams.get("status") || "").trim();
    const limit = Math.min(200, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || 50)));

    const filter: Record<string, unknown> = {};
    if (channel) filter.channel = channel;
    if (status) filter.status = status;

    const notifications = await NotificationLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, notifications }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`notify-create:${getClientKey(req)}`, 40, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const channel = String(body.channel || "").trim();
    const to = String(body.to || "").trim();
    const message = String(body.message || "").trim();

    if (!channel || !to || !message) {
      return NextResponse.json(
        { success: false, message: "channel, to and message are required" },
        { status: 400 }
      );
    }

    await notify({
      channel: channel as "email" | "sms" | "whatsapp" | "in_app",
      to,
      subject: body.subject ? String(body.subject) : undefined,
      message,
      templateKey: body.templateKey ? String(body.templateKey) : undefined,
      relatedEntityType: body.relatedEntityType ? String(body.relatedEntityType) : undefined,
      relatedEntityId: body.relatedEntityId ? String(body.relatedEntityId) : undefined,
      meta: { triggeredBy: auth.payload.email },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to queue notification",
      },
      { status: 500 }
    );
  }
}
