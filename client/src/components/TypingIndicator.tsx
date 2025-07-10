"use client";

import { useAppSelector } from "@/store/hooks";
import { User } from "../../../shared/index";

interface TypingIndicatorProps {
  users: string[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  const activeConversation = useAppSelector(
    (state) => state.conversations.activeConversation
  );
  const currentUser = useAppSelector((state) => state.auth.user);

  // Filter out current user from typing users
  const typingUsers = users.filter((userId) => userId !== currentUser?._id);

  if (typingUsers.length === 0) return null;

  const getUsername = (userId: string) => {
    if (!activeConversation) return "Someone";

    const participant = activeConversation.participants.find(
      (p: string | User) => typeof p !== "string" && p._id === userId
    ) as User | undefined;

    return participant?.username || "Someone";
  };

  const typingText =
    typingUsers.length === 1
      ? `${getUsername(typingUsers[0])} is typing...`
      : `${typingUsers.length} people are typing...`;

  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
      <div className="flex items-center space-x-2">
        <span>{typingText}</span>
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-200"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce animation-delay-400"></span>
        </div>
      </div>
    </div>
  );
}
