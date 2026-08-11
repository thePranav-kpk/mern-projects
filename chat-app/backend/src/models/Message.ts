import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  room: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema<IMessage>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    room: {
      type: String,
      index: true,
      trim: true,
      required: [true, "Room is required"],
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Content is required"],
    },
  },
  { timestamps: true },
);

export default mongoose.model<IMessage>("Message", MessageSchema);
