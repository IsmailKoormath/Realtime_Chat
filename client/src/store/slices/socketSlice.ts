import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SocketState {
  isConnected: boolean;
  connectionError: string | null;
  reconnectAttempts: number;
}

const initialState: SocketState = {
  isConnected: false,
  connectionError: null,
  reconnectAttempts: 0,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.connectionError = null;
        state.reconnectAttempts = 0;
      }
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload;
      state.isConnected = false;
    },
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },
  },
});

export const { setConnected, setConnectionError, incrementReconnectAttempts } =
  socketSlice.actions;
export default socketSlice.reducer;
