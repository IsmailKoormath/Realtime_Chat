"use client";

import { useMemo } from "react";
import { format, isValid, parseISO } from "date-fns";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setActiveConversation } from "@/store/slices/conversationSlice";
import { Conversation, User } from "../../../shared/index";
import Avatar from "./Avatar";

export default function ConversationList() {
  const dispatch = useAppDispatch();
  const { conversations, activeConversation } = useAppSelector(
    (state) => state.conversations
  );
  const { searchQuery, sidebarOpen } = useAppSelector((state) => state.ui);
  const { unreadCounts } = useAppSelector((state) => state.messages);
  const currentUser = useAppSelector((state) => state.auth.user);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;

    return conversations.filter((conversation) => {
      if (conversation.isGroup) {
        return conversation.groupName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      }

      const otherParticipant = conversation.participants.find(
        (p: string | User) =>
          typeof p !== "string" && p._id !== currentUser?._id
      ) as User | undefined;

      return otherParticipant?.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, currentUser]);

  const getConversationName = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.groupName || "Group Chat";
    }

    const otherParticipant = conversation.participants.find(
      (p: string | User) => typeof p !== "string" && p._id !== currentUser?._id
    ) as User | undefined;

    return otherParticipant?.username || "Unknown User";
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.groupAvatar || null;
    }

    const otherParticipant = conversation.participants.find(
      (p: string | User) => typeof p !== "string" && p._id !== currentUser?._id
    ) as User | undefined;

    return otherParticipant?.avatar || null;
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return "No messages yet";

    const { content, type, sender } = conversation.lastMessage;
    const senderName = typeof sender === "string" ? "Someone" : sender.username;
    const isMe = typeof sender !== "string" && sender._id === currentUser?._id;

    if (type === "image") return `${isMe ? "You" : senderName} sent an image`;
    if (type === "file") return `${isMe ? "You" : senderName} sent a file`;

    return `${isMe ? "You: " : `${senderName}: `}${content}`;
  };

  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return "";

    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "";

      return format(date, "HH:mm");
    } catch (error) {
      console.error("Invalid date:", dateString,error);
      return "";
    }
  };

  if (!sidebarOpen) {
    return (
      <div className="p-2 space-y-2">
        {filteredConversations.slice(0, 5).map((conversation) => (
          <button
            key={conversation._id}
            onClick={() => dispatch(setActiveConversation(conversation))}
            className={`relative w-full p-2 rounded-lg transition-all ${
              activeConversation?._id === conversation._id
                ? "bg-purple-100 dark:bg-purple-900/20"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Avatar
              src={getConversationAvatar(conversation)}
              alt={getConversationName(conversation)}
              size="sm"
              isOnline={
                !conversation.isGroup &&
                (
                  conversation.participants.find(
                    (p: string | User) =>
                      typeof p !== "string" && p._id !== currentUser?._id
                  ) as User
                )?.isOnline
              }
            />
            {unreadCounts[conversation._id] > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filteredConversations.map((conversation) => {
        const messageTime = formatMessageTime(
          conversation.lastMessage?.createdAt
        );

        return (
          <button
            key={conversation._id}
            onClick={() => dispatch(setActiveConversation(conversation))}
            className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              activeConversation?._id === conversation._id
                ? "bg-purple-50 dark:bg-purple-900/10 border-l-4 border-purple-600"
                : ""
            }`}
          >
            <Avatar
              src={getConversationAvatar(conversation)}
              alt={getConversationName(conversation)}
              isOnline={
                !conversation.isGroup &&
                (
                  conversation.participants.find(
                    (p: string | User) =>
                      typeof p !== "string" && p._id !== currentUser?._id
                  ) as User
                )?.isOnline
              }
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {getConversationName(conversation)}
                </h3>
                {messageTime && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {messageTime}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {getLastMessagePreview(conversation)}
              </p>
            </div>
            {unreadCounts[conversation._id] > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                {unreadCounts[conversation._id]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
