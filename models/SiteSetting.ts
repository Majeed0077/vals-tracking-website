import mongoose, { Schema, model, models } from "mongoose";

export interface ISiteSetting extends mongoose.Document {
  key: string;
  marketing: {
    announcementText?: string;
    heroBannerTitle?: string;
    heroBannerSubtitle?: string;
    promoEnabled: boolean;
    promoText?: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
  };
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: { type: String, required: true, unique: true, trim: true, default: "global" },
    marketing: {
      announcementText: { type: String, trim: true },
      heroBannerTitle: { type: String, trim: true },
      heroBannerSubtitle: { type: String, trim: true },
      promoEnabled: { type: Boolean, default: false },
      promoText: { type: String, trim: true },
    },
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      metaKeywords: { type: [String], default: [] },
      ogImage: { type: String, trim: true },
    },
    updatedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

const SiteSetting =
  (models.SiteSetting as mongoose.Model<ISiteSetting>) ||
  model<ISiteSetting>("SiteSetting", SiteSettingSchema);

export default SiteSetting;
