import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    dateOfBirth: { type: Date },
    addresses: {
      type: [
        {
          label: { type: String, trim: true },
          fullName: { type: String, trim: true },
          phone: { type: String, trim: true },
          line1: { type: String, trim: true },
          line2: { type: String, trim: true },
          city: { type: String, trim: true },
          state: { type: String, trim: true },
          postalCode: { type: String, trim: true },
          country: { type: String, trim: true, default: "Pakistan" },
          isDefaultShipping: { type: Boolean, default: false },
          isDefaultBilling: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    preferences: {
      newsletter: { type: Boolean, default: true },
      emailOffers: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: false },
      whatsappAlerts: { type: Boolean, default: false },
      language: { type: String, trim: true, default: "en" },
      currency: { type: String, trim: true, default: "PKR" },
    },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
