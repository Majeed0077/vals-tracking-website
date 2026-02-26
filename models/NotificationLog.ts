import mongoose, { Schema, model, models } from "mongoose";

export type NotificationChannel = "email" | "sms" | "whatsapp" | "in_app";
export type NotificationStatus = "queued" | "sent" | "failed";

export interface INotificationLog extends mongoose.Document {
  channel: NotificationChannel;
  to: string;
  subject?: string;
  message: string;
  templateKey?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  status: NotificationStatus;
  error?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationLogSchema = new Schema<INotificationLog>(
  {
    channel: {
      type: String,
      enum: ["email", "sms", "whatsapp", "in_app"],
      required: true,
    },
    to: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    templateKey: { type: String, trim: true },
    relatedEntityType: { type: String, trim: true },
    relatedEntityId: { type: String, trim: true },
    status: {
      type: String,
      enum: ["queued", "sent", "failed"],
      default: "queued",
    },
    error: { type: String, trim: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const NotificationLog =
  (models.NotificationLog as mongoose.Model<INotificationLog>) ||
  model<INotificationLog>("NotificationLog", NotificationLogSchema);

export default NotificationLog;
