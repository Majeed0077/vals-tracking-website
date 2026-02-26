import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { requireAdmin } from "@/lib/routeAuth";
import { logAudit } from "@/lib/audit";
import { enforceRateLimit, enforceSameOrigin, getClientKey } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const originError = enforceSameOrigin(req);
    if (originError) return originError;

    const rlError = enforceRateLimit(`customer-update:${getClientKey(req)}`, 35, 60_000);
    if (rlError) return rlError;

    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid customer id" },
        { status: 400 }
      );
    }

    await connectDB();
    const body = await req.json();

    const update: Record<string, unknown> = {};
    if (body.segment !== undefined) update.segment = body.segment;
    if (body.tags !== undefined && Array.isArray(body.tags)) update.tags = body.tags;
    if (body.notes !== undefined) update.notes = String(body.notes || "").trim() || undefined;
    if (body.name !== undefined) update.name = String(body.name || "").trim() || undefined;
    if (body.phone !== undefined) update.phone = String(body.phone || "").trim() || undefined;

    const customer = await Customer.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    await logAudit({
      action: "customer.update",
      actorId: auth.payload.sub,
      actorEmail: auth.payload.email,
      actorRole: auth.payload.role,
      entityType: "Customer",
      entityId: id,
      message: `Updated customer ${id}`,
    });

    return NextResponse.json({ success: true, customer }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/customers/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update customer",
      },
      { status: 500 }
    );
  }
}
