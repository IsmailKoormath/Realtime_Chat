import { Chat, IChat } from "../models/Chat";
import { IChat as ChatType } from "../models/Chat";
import mongoose from "mongoose";

/**
 * Access or create one-on-one chat between two users
 */
export const accessChat = async (
  userId: string,
  otherUserId: string
): Promise<ChatType> => {
  if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
    throw new Error("Invalid user ID");
  }

  const existingChat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [userId, otherUserId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  if (existingChat) return existingChat;

  const newChat = await Chat.create({
    chatName: "Direct Chat",
    isGroupChat: false,
    users: [userId, otherUserId],
  });

  return newChat.populate("users", "-password");
};

/**
 * Fetch all chats for a user
 */
export const getChatsForUser = async (userId: string): Promise<IChat[]> => {
  return Chat.find({ users: userId })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name email avatar" },
    })
    .sort({ updatedAt: -1 });
};

/**
 * Create a new group chat
 */
export const createGroupChat = async (
  name: string,
  userIds: string[],
  creatorId: string
): Promise<IChat> => {
  const uniqueUsers = Array.from(new Set([...userIds, creatorId]));

  if (uniqueUsers.length < 3) {
    throw new Error("Group chat requires at least 3 users (including creator)");
  }

  const groupChat = await Chat.create({
    chatName: name,
    isGroupChat: true,
    users: uniqueUsers,
    groupAdmin: creatorId,
  });

  return (await groupChat
      .populate("users", "-password"))
    .populate("groupAdmin", "-password");
};

/**
 * Rename a group chat
 */
export const renameGroup = async (
  chatId: string,
  newName: string
): Promise<IChat> => {
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: newName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) throw new Error("Chat not found");

  return updatedChat;
};

/**
 * Add a user to a group chat
 */
export const addToGroup = async (
  chatId: string,
  userId: string
): Promise<IChat> => {
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) throw new Error("Failed to add user to group");

  return updatedChat;
};

/**
 * Remove a user from a group chat
 */
export const removeFromGroup = async (
  chatId: string,
  userId: string
): Promise<IChat> => {
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) throw new Error("Failed to remove user from group");

  return updatedChat;
};
