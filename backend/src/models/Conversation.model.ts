import mongoose, { Document, Schema } from "mongoose";
import { Conversation } from "../../../shared/index";

export interface IConversationDocument
  extends Omit<Conversation, "_id">,
    Document {}

const conversationSchema = new Schema<IConversationDocument>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      required: function (this: IConversationDocument) {
        return this.isGroup;
      },
    },
    groupAvatar: String,
    admins: [
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

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export const ConversationModel = mongoose.model<IConversationDocument>(
  "Conversation",
  conversationSchema
);
