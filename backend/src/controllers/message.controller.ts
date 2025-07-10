import { Response } from "express";
import { MessageModel } from "../models/Message.model";
import { ConversationModel } from "../models/Conversation.model";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";
import { io } from "../index";

export const getMessages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await ConversationModel.findById(conversationId);

    if (
      !conversation ||
      !conversation.participants.includes(req.userId as any)
    ) {
      throw new AppError("Conversation not found", 404);
    }

    const messages = await MessageModel.find({ conversationId })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Mark messages as read
    await MessageModel.updateMany(
      {
        conversationId,
        sender: { $ne: req.userId },
        readBy: { $ne: req.userId },
      },
      {
        $addToSet: { readBy: req.userId },
      }
    );

    res.json({
      success: true,
      data: messages.reverse(),
    });
  }
);

export const sendMessage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { conversationId, content, type = "text" } = req.body;

    const conversation = await ConversationModel.findById(conversationId);

    if (
      !conversation ||
      !conversation.participants.includes(req.userId as any)
    ) {
      throw new AppError("Conversation not found", 404);
    }

    const message = await MessageModel.create({
      conversationId,
      sender: req.userId,
      content,
      type,
      readBy: [req.userId],
    });

    await message.populate("sender", "username avatar");

    // Update conversation's last message
    conversation.lastMessage = message._id as any;
    await conversation.save();

    // Emit to all participants except sender
    const participantIds = conversation.participants
      .map((p: any) => p._id.toString())
      .filter((id: string) => id !== req.userId);

    participantIds.forEach((participantId: string) => {
      io.to(`user:${participantId}`).emit("message:receive", message);
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  }
);

export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { messageId } = req.params;

    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { readBy: req.userId },
      },
      { new: true }
    );

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    io.to(`conversation:${message.conversationId}`).emit("message:read", {
      messageId,
      userId: req.userId,
    });

    res.json({
      success: true,
      data: message,
    });
  }
);
