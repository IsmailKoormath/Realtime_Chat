import { io, Socket } from "socket.io-client";
import { store } from "@/store";
import {
  addMessage,
  setTypingUser,
  updateMessageReadStatus,
  incrementUnreadCount,
} from "@/store/slices/messageSlice";
import {
  updateConversationLastMessage,
  updateUserOnlineStatus,
  addConversation,
} from "@/store/slices/conversationSlice";
import { setConnected, setConnectionError } from "@/store/slices/socketSlice";
import { Message, Conversation } from "../../../shared/index";

class SocketService {
  private socket: Socket | null = null;
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
      {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      store.dispatch(setConnected(true));
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      store.dispatch(setConnected(false));
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      store.dispatch(setConnectionError(error.message));
    });

    this.socket.on("message:receive", (message: Message) => {
      store.dispatch(addMessage(message));
      store.dispatch(
        updateConversationLastMessage({
          conversationId: message.conversationId,
          message,
        })
      );

      const state = store.getState();
      const activeConversationId = state.conversations.activeConversation?._id;

      if (message.conversationId !== activeConversationId) {
        store.dispatch(incrementUnreadCount(message.conversationId));
      }
    });

    this.socket.on("user:online", (userId: string) => {
      store.dispatch(updateUserOnlineStatus({ userId, isOnline: true }));
    });

    this.socket.on("user:offline", (userId: string) => {
      store.dispatch(updateUserOnlineStatus({ userId, isOnline: false }));
    });

    // Fixed typing handlers
    this.socket.on(
      "typing:start",
      (data: { conversationId: string; userId: string }) => {
        console.log("Received typing:start", data);
        store.dispatch(
          setTypingUser({
            conversationId: data.conversationId,
            userId: data.userId,
            isTyping: true,
          })
        );

        // Auto-stop typing after 3 seconds if no stop event received
        const timerId = this.typingTimers.get(
          `${data.conversationId}-${data.userId}`
        );
        if (timerId) {
          clearTimeout(timerId);
        }

        const newTimerId = setTimeout(() => {
          store.dispatch(
            setTypingUser({
              conversationId: data.conversationId,
              userId: data.userId,
              isTyping: false,
            })
          );
          this.typingTimers.delete(`${data.conversationId}-${data.userId}`);
        }, 3000);

        this.typingTimers.set(
          `${data.conversationId}-${data.userId}`,
          newTimerId
        );
      }
    );

    this.socket.on(
      "typing:stop",
      (data: { conversationId: string; userId: string }) => {
        console.log("Received typing:stop", data);
        store.dispatch(
          setTypingUser({
            conversationId: data.conversationId,
            userId: data.userId,
            isTyping: false,
          })
        );

        const timerId = this.typingTimers.get(
          `${data.conversationId}-${data.userId}`
        );
        if (timerId) {
          clearTimeout(timerId);
          this.typingTimers.delete(`${data.conversationId}-${data.userId}`);
        }
      }
    );

    this.socket.on(
      "message:read",
      ({ messageId, userId }: { messageId: string; userId: string }) => {
        store.dispatch(updateMessageReadStatus({ messageId, userId }));
      }
    );

    this.socket.on("conversation:created", (conversation: Conversation) => {
      store.dispatch(addConversation(conversation));
    });
  }

  joinConversation(conversationId: string) {
    console.log("Joining conversation:", conversationId);
    this.socket?.emit("conversation:join", conversationId);
  }

  sendTypingStart(conversationId: string) {
    console.log("Sending typing:start for conversation:", conversationId);
    this.socket?.emit("typing:start", conversationId);
  }

  sendTypingStop(conversationId: string) {
    console.log("Sending typing:stop for conversation:", conversationId);
    this.socket?.emit("typing:stop", conversationId);
  }

  markMessageAsRead(messageId: string) {
    this.socket?.emit("message:markAsRead", messageId);
  }

  disconnect() {
    // Clear all typing timers
    this.typingTimers.forEach((timer) => clearTimeout(timer));
    this.typingTimers.clear();

    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
