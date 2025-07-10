import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  activeView: "chats" | "contacts" | "settings";
  theme: "light" | "dark" | "system";
  emojiPickerOpen: boolean;
  searchQuery: string;
  showUserProfile: boolean;
  selectedUserId: string | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  activeView: "chats",
  theme: "system",
  emojiPickerOpen: false,
  searchQuery: "",
  showUserProfile: false,
  selectedUserId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setActiveView: (state, action: PayloadAction<UIState["activeView"]>) => {
      state.activeView = action.payload;
    },
    setTheme: (state, action: PayloadAction<UIState["theme"]>) => {
      state.theme = action.payload;
    },
    toggleEmojiPicker: (state) => {
      state.emojiPickerOpen = !state.emojiPickerOpen;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setShowUserProfile: (
      state,
      action: PayloadAction<{ show: boolean; userId?: string }>
    ) => {
      state.showUserProfile = action.payload.show;
      state.selectedUserId = action.payload.userId || null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveView,
  setTheme,
  toggleEmojiPicker,
  setSearchQuery,
  setShowUserProfile,
} = uiSlice.actions;

export default uiSlice.reducer;
