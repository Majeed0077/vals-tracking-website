import mongoose, { Schema, model, models } from "mongoose";

export interface IAuditLog extends mongoose.Document {
  actorId?: mongoose.Types.ObjectId;
  actorEmail?: string;
  actorRole?: "admin" | "user";
  action: string;
  entityType?: string;
  entityId?: string;
  message?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId },
    actorEmail: { type: String, trim: true },
    actorRole: { type: String, enum: ["admin", "user"] },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, trim: true },
    entityId: { type: String, trim: true },
    message: { type: String, trim: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const AuditLog =
  (models.AuditLog as mongoose.Model<IAuditLog>) ||
  model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
