"use client";

import { useAppSelector } from "@/store/hooks";
import ChatWindow from "@/components/ChatWindow";
import EmptyState from "@/components/EmptyState";

export default function ChatPage() {
  const activeConversation = useAppSelector(
    (state) => state.conversations.activeConversation
  );

  if (!activeConversation) {
    return <EmptyState />;
  }

  return <ChatWindow />;
}
