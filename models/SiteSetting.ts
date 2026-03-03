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
  commerce: {
    productDetail: {
      deliveryLocation: string;
      standardDeliveryFee: number;
      collectionPointFee: number;
      codLabel: string;
      returnPolicy: string;
      warrantyLabel: string;
      sellerName: string;
      sellerRating: number;
      shipOnTime: number;
      responseTime: string;
    };
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
    commerce: {
      productDetail: {
        deliveryLocation: { type: String, trim: true, default: "Sindh, Karachi" },
        standardDeliveryFee: { type: Number, default: 140, min: 0 },
        collectionPointFee: { type: Number, default: 30, min: 0 },
        codLabel: { type: String, trim: true, default: "Available" },
        returnPolicy: { type: String, trim: true, default: "14 days easy return" },
        warrantyLabel: { type: String, trim: true, default: "12 months" },
        sellerName: { type: String, trim: true, default: "VALS Official Store" },
        sellerRating: { type: Number, default: 93, min: 0, max: 100 },
        shipOnTime: { type: Number, default: 99, min: 0, max: 100 },
        responseTime: { type: String, trim: true, default: "Fast" },
      },
    },
    updatedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

const SiteSetting =
  (models.SiteSetting as mongoose.Model<ISiteSetting>) ||
  model<ISiteSetting>("SiteSetting", SiteSettingSchema);

export default SiteSetting;
