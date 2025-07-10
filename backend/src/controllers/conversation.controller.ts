import { Response } from "express";
import { ConversationModel } from "../models/Conversation.model";
import { UserModel } from "../models/User.model";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth.middleware";

export const getConversations = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const conversations = await ConversationModel.find({
      participants: req.userId,
    })
      .populate("participants", "username avatar isOnline lastSeen")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username",
        },
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: conversations,
    });
  }
);

export const createConversation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { participantIds, isGroup, groupName } = req.body;

    if (!participantIds || participantIds.length === 0) {
      throw new AppError("Participants are required", 400);
    }

    const allParticipants = [...new Set([req.userId, ...participantIds])];

    if (!isGroup && allParticipants.length === 2) {
      // Check if direct conversation already exists
      const existingConversation = await ConversationModel.findOne({
        isGroup: false,
        participants: { $all: allParticipants, $size: 2 },
      });

      if (existingConversation) {
        await existingConversation.populate(
          "participants",
          "username avatar isOnline lastSeen"
        );
        return res.json({
          success: true,
          data: existingConversation,
        });
      }
    }

    if (isGroup && !groupName) {
      throw new AppError("Group name is required", 400);
    }

    const conversation = await ConversationModel.create({
      participants: allParticipants,
      isGroup,
      groupName,
      admins: isGroup ? [req.userId] : undefined,
    });

    await conversation.populate(
      "participants",
      "username avatar isOnline lastSeen"
    );

    res.status(201).json({
      success: true,
      data: conversation,
    });
  }
);

export const updateConversation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { conversationId } = req.params;
    const { groupName, groupAvatar } = req.body;

    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    if (!conversation.isGroup) {
      throw new AppError("Cannot update direct conversations", 400);
    }

    if (!conversation.admins?.includes(req.userId as any)) {
      throw new AppError("Only admins can update group info", 403);
    }

    if (groupName) conversation.groupName = groupName;
    if (groupAvatar) conversation.groupAvatar = groupAvatar;

    await conversation.save();
    await conversation.populate(
      "participants",
      "username avatar isOnline lastSeen"
    );

    res.json({
      success: true,
      data: conversation,
    });
  }
);

export const addParticipants = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { conversationId } = req.params;
    const { participantIds } = req.body;

    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation || !conversation.isGroup) {
      throw new AppError("Group conversation not found", 404);
    }

    if (!conversation.admins?.includes(req.userId as any)) {
      throw new AppError("Only admins can add participants", 403);
    }

    conversation.participants.push(...participantIds);
    await conversation.save();
    await conversation.populate(
      "participants",
      "username avatar isOnline lastSeen"
    );

    res.json({
      success: true,
      data: conversation,
    });
  }
);
