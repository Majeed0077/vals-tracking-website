import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";

type AuditInput = {
  action: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: "admin" | "user";
  entityType?: string;
  entityId?: string;
  message?: string;
  meta?: Record<string, unknown>;
};

export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create(input);
  } catch (error) {
    console.error("AUDIT LOG ERROR:", error);
  }
}
