import mongoose, { Schema, Document } from "mongoose";

// TypeScript Interface for Url Document
export interface IUrl extends Document {
  originalUrl: string;
  shortCode: string;
  clicks: number;
  lastClickedAt?: Date | null;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UrlSchema: Schema = new Schema(
  {
    originalUrl: {
      type: String,
      required: [true, "Please provide original URL"],
      trim: true,
    },
    shortCode: {
      type: String,
      required: [true, "Please provide short code"],
      unique: true,
      index: true,
      trim: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    lastClickedAt: {
      type: Date,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUrl>("Url", UrlSchema);
