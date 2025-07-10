import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Conversation, Message } from "../../../../shared/index";
import { conversationAPI } from "@/services/api";

interface ConversationState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: ConversationState = {
  conversations: [],
  activeConversation: null,
  isLoading: false,
  error: null,
  hasMore: true,
  page: 1,
};

export const fetchConversations = createAsyncThunk(
  "conversations/fetchAll",
  async () => {
    const response = await conversationAPI.getConversations();
    return response.data;
  }
);

export const createConversation = createAsyncThunk(
  "conversations/create",
  async (data: {
    participantIds: string[];
    isGroup?: boolean;
    groupName?: string;
  }) => {
    const response = await conversationAPI.createConversation(data);
    return response.data;
  }
);

export const updateConversation = createAsyncThunk(
  "conversations/update",
  async ({ id, data }: { id: string; data: Partial<Conversation> }) => {
    const response = await conversationAPI.updateConversation(id, data);
    return response.data;
  }
);

const conversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    setActiveConversation: (
      state,
      action: PayloadAction<Conversation | null>
    ) => {
      state.activeConversation = action.payload;
    },
    updateConversationLastMessage: (
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>
    ) => {
      const conversation = state.conversations.find(
        (c) => c._id === action.payload.conversationId
      );
      if (conversation) {
        conversation.lastMessage = action.payload.message;
        conversation.updatedAt = action.payload.message.createdAt;
      }
      // Sort conversations by updated time
      state.conversations.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    },
    updateUserOnlineStatus: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean }>
    ) => {
      state.conversations.forEach((conversation) => {
        if (!conversation.isGroup && Array.isArray(conversation.participants)) {
          const participant = conversation.participants.find(
            (p) => typeof p !== "string" && p._id === action.payload.userId
          );
          if (participant && typeof participant !== "string") {
            participant.isOnline = action.payload.isOnline;
            if (!action.payload.isOnline) {
              participant.lastSeen = new Date().toISOString(); // Store as string
            }
          }
        }
      });
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const exists = state.conversations.some(
        (c) => c._id === action.payload._id
      );
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch conversations";
      });

    builder.addCase(createConversation.fulfilled, (state, action) => {
      state.conversations.unshift(action.payload);
      state.activeConversation = action.payload;
    });

    builder.addCase(updateConversation.fulfilled, (state, action) => {
      const index = state.conversations.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
      if (state.activeConversation?._id === action.payload._id) {
        state.activeConversation = action.payload;
      }
    });
  },
});

export const {
  setActiveConversation,
  updateConversationLastMessage,
  updateUserOnlineStatus,
  addConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;
