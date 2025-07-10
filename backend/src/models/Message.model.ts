import mongoose, { Document, Schema } from "mongoose";
import { Message } from "../../../shared/index";

export interface IMessageDocument extends Omit<Message, "_id">, Document {}

const messageSchema = new Schema<IMessageDocument>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: function (this: IMessageDocument) {
        return this.type === "text";
      },
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: {
      type: String,
      required: function (this: IMessageDocument) {
        return this.type === "image" || this.type === "file";
      },
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret._id = ret._id.toString();
        ret.createdAt = ret.createdAt?.toISOString();
        ret.updatedAt = ret.updatedAt?.toISOString();
        return ret;
      },
    },
  }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const MessageModel = mongoose.model<IMessageDocument>(
  "Message",
  messageSchema
);
