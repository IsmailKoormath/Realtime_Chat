import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.model";
import { MessageModel } from "../models/Message.model";
import { ConversationModel } from "../models/Conversation.model";
import { logger } from "../utils/logger";

interface SocketWithAuth extends Socket {
  userId?: string;
}

export const initializeSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: SocketWithAuth, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      socket.userId = decoded.userId;

      // Join user's personal room
      socket.join(`user:${decoded.userId}`);

      // Update user online status
      await UserModel.findByIdAndUpdate(decoded.userId, {
        isOnline: true,
        lastSeen: new Date(),
      });

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket: SocketWithAuth) => {
    logger.info(`User ${socket.userId} connected`);

    // Join conversation rooms
    const conversations = await ConversationModel.find({
      participants: socket.userId,
    });

    conversations.forEach((conversation) => {
      socket.join(`conversation:${conversation._id}`);
    });

    // Notify others that user is online
    socket.broadcast.emit("user:online", socket.userId);

    // Handle joining a conversation room
    socket.on("conversation:join", async (conversationId: string) => {
      const conversation = await ConversationModel.findOne({
        _id: conversationId,
        participants: socket.userId,
      });

      if (conversation) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    // Handle typing indicators
    socket.on("typing:start", (conversationId: string) => {
      console.log(`User ${socket.userId} started typing in ${conversationId}`);

      // Emit to all users in the conversation except the sender
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        conversationId,
        userId: socket.userId,
      });
    });

    socket.on("typing:stop", (conversationId: string) => {
      console.log(`User ${socket.userId} stopped typing in ${conversationId}`);

      // Emit to all users in the conversation except the sender
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        conversationId,
        userId: socket.userId,
      });
    });

    // Handle message read receipts
    socket.on("message:markAsRead", async (messageId: string) => {
      const message = await MessageModel.findByIdAndUpdate(
        messageId,
        {
          $addToSet: { readBy: socket.userId },
        },
        { new: true }
      );

      if (message) {
        socket
          .to(`conversation:${message.conversationId}`)
          .emit("message:read", {
            messageId,
            userId: socket.userId,
          });
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      logger.info(`User ${socket.userId} disconnected`);

      // Update user offline status
      await UserModel.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      // Notify others that user is offline
      socket.broadcast.emit("user:offline", socket.userId);
    });
  });
};
