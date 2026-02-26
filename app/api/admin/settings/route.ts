import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SiteSetting from "@/models/SiteSetting";
import { requireAdmin } from "@/lib/routeAuth";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();
    let setting = await SiteSetting.findOne({ key: "global" }).lean();
    if (!setting) {
      setting = await SiteSetting.create({ key: "global" });
    }

    return NextResponse.json({ success: true, setting }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch settings",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`settings-update:${getClientKey(req)}`, 30, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    await connectDB();
    const body = await req.json();

    const update: Record<string, unknown> = {
      updatedBy: auth.payload.email,
    };
    if (body.marketing && typeof body.marketing === "object") {
      update.marketing = body.marketing;
    }
    if (body.seo && typeof body.seo === "object") {
      update.seo = body.seo;
    }

    const setting = await SiteSetting.findOneAndUpdate(
      { key: "global" },
      update,
      { new: true, upsert: true }
    ).lean();

    await logAudit({
      action: "settings.update",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "SiteSetting",
      entityId: "global",
      message: "Updated site settings",
    });

    return NextResponse.json({ success: true, setting }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update settings",
      },
      { status: 500 }
    );
  }
}
