import { Message, IMessage } from "../models/Message";
import { Chat } from "../models/Chat";
import mongoose from "mongoose";

/**
 * Send a message to a chat
 */
export const sendMessageToChat = async (
  senderId: string,
  chatId: string,
  content: string
): Promise<IMessage> => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new Error("Invalid chat ID");
  }

  const message = await Message.create({
    sender: senderId,
    content,
    chat: chatId,
  });

  // Update latestMessage on chat
  await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

  return (await message.populate("sender", "-password"))
    .populate("chat")
    // .execPopulate?.();
};

/**
 * Get all messages for a chat
 */
export const getMessagesForChat = async (
  chatId: string
): Promise<IMessage[]> => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new Error("Invalid chat ID");
  }

  return Message.find({ chat: chatId })
    .populate("sender", "name email avatar")
    .populate("chat")
    .sort({ createdAt: 1 });
};
