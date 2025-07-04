import { Chat, IChat } from "../models/Chat";
import { Message, IMessage } from "../models/Message";
import mongoose from "mongoose";

export const getChatsForUser = async (userId: string): Promise<IChat[]> => {
  return Chat.find({ users: userId })
    .populate("users", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });
};

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

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

  return message.populate("sender", "-password");
};
