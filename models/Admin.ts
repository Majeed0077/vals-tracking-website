import { Schema, model, models } from "mongoose";

const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    department: { type: String, trim: true },
    timezone: { type: String, trim: true, default: "Asia/Karachi" },
    preferences: {
      emailAlerts: { type: Boolean, default: true },
      orderAlerts: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
      reportDigest: { type: Boolean, default: false },
      language: { type: String, trim: true, default: "en" },
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default models.Admin || model("Admin", AdminSchema);
