import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../../../../shared/index';
import { messageAPI } from '@/services/api';

interface MessageState {
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoading: Record<string, boolean>;
  hasMore: Record<string, boolean>;
  typingUsers: Record<string, string[]>; // conversationId -> userIds
  unreadCounts: Record<string, number>;
}

const initialState: MessageState = {
  messages: {},
  isLoading: {},
  hasMore: {},
  typingUsers: {},
  unreadCounts: {},
};

export const fetchMessages = createAsyncThunk(
  'messages/fetch',
  async ({ conversationId, page = 1 }: { conversationId: string; page?: number }) => {
    const response = await messageAPI.getMessages(conversationId, page);
    return { conversationId, messages: response.data, page };
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (data: { conversationId: string; content: string; type?: 'text' | 'image' | 'file' }) => {
    const response = await messageAPI.sendMessage(data);
    return response.data;
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId: string) => {
    const response = await messageAPI.markAsRead(messageId);
    return response.data;
  }
);

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const { conversationId } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }

      // Check if message already exists
      const exists = state.messages[conversationId].some(
        (m) => m._id === action.payload._id
      );
      if (!exists) {
        state.messages[conversationId].push(action.payload);
      }
    },
    setTypingUser: (
      state,
      action: PayloadAction<{
        conversationId: string;
        userId: string;
        isTyping: boolean;
      }>
    ) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }

      if (isTyping && !state.typingUsers[conversationId].includes(userId)) {
        state.typingUsers[conversationId].push(userId);
      } else if (!isTyping) {
        state.typingUsers[conversationId] = state.typingUsers[
          conversationId
        ].filter((id) => id !== userId);
      }
    },
    updateMessageReadStatus: (
      state,
      action: PayloadAction<{ messageId: string; userId: string }>
    ) => {
      Object.values(state.messages).forEach((messages) => {
        const message = messages.find(
          (m) => m._id === action.payload.messageId
        );
        if (message && !message.readBy.includes(action.payload.userId)) {
          message.readBy.push(action.payload.userId);
        }
      });
    },
    incrementUnreadCount: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] =
        (state.unreadCounts[conversationId] || 0) + 1;
    },
    resetUnreadCount: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = 0;
    },
    clearMessages: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      delete state.messages[conversationId];
      delete state.isLoading[conversationId];
      delete state.hasMore[conversationId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        state.isLoading[action.meta.arg.conversationId] = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages, page } = action.payload;
        state.isLoading[conversationId] = false;

        if (page === 1) {
          state.messages[conversationId] = messages;
        } else {
          state.messages[conversationId] = [
            ...messages,
            ...(state.messages[conversationId] || []),
          ];
        }

        state.hasMore[conversationId] = messages.length === 50; // Assuming 50 messages per page
        state.unreadCounts[conversationId] = 0;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading[action.meta.arg.conversationId] = false;
      });

    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const message = action.payload;
      if (!state.messages[message.conversationId]) {
        state.messages[message.conversationId] = [];
      }
      state.messages[message.conversationId].push(message);
    });

    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const updatedMessage = action.payload;
      Object.values(state.messages).forEach((messages) => {
        const index = messages.findIndex((m) => m._id === updatedMessage._id);
        if (index !== -1) {
          messages[index] = updatedMessage;
        }
      });
    });
  },
});

export const {
  addMessage,
  setTypingUser,
  updateMessageReadStatus,
  incrementUnreadCount,
  resetUnreadCount,
  clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;