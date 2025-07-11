"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchMessages, resetUnreadCount } from "@/store/slices/messageSlice";
import { socketService } from "@/services/socket";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow() {
  const dispatch = useAppDispatch();
  const activeConversation = useAppSelector(
    (state) => state.conversations.activeConversation
  );
  const messages = useAppSelector((state) =>
    activeConversation
      ? state.messages.messages[activeConversation._id] || []
      : []
  );
  const typingUsers = useAppSelector((state) =>
    activeConversation
      ? state.messages.typingUsers[activeConversation._id] || []
      : [],
  );
console.log('====================================');
console.log(typingUsers,'users typing');
console.log('====================================');
  useEffect(() => {
    if (activeConversation) {
      dispatch(fetchMessages({ conversationId: activeConversation._id }));
      dispatch(resetUnreadCount(activeConversation._id));
      socketService.joinConversation(activeConversation._id);
    }
  }, [activeConversation, dispatch]);

  if (!activeConversation) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <ChatHeader conversation={activeConversation} />

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 opacity-50"></div>
        <MessageList
          messages={messages}
          conversationId={activeConversation._id}
        />
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
      </div>

      <MessageInput conversationId={activeConversation._id} />
    </div>
  );
}
