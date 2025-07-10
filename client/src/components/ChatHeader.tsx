"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setShowUserProfile } from "@/store/slices/uiSlice";
import { Conversation, User } from "../../../shared/index";
import Avatar from "./Avatar";
import {
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface ChatHeaderProps {
  conversation: Conversation;
}

export default function ChatHeader({ conversation }: ChatHeaderProps) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const getConversationName = () => {
    if (conversation.isGroup) {
      return conversation.groupName || "Group Chat";
    }

    const otherParticipant = conversation.participants.find(
      (p) => typeof p !== "string" && p._id !== currentUser?._id
    ) as User | undefined;

    return otherParticipant?.username || "Unknown User";
  };

  const getConversationStatus = () => {
    if (conversation.isGroup) {
      const participantCount = conversation.participants.length;
      return `${participantCount} members`;
    }

    const otherParticipant = conversation.participants.find(
      (p: string | User) => typeof p !== "string" && p._id !== currentUser?._id
    ) as User | undefined;

    if (otherParticipant?.isOnline) {
      return "Online";
    }

    return otherParticipant?.lastSeen
      ? `Last seen ${new Date(otherParticipant.lastSeen).toLocaleString()}`
      : "Offline";
  };

  const getConversationAvatar = () => {
    if (conversation.isGroup) {
      return conversation.groupAvatar || null;
    }

    const otherParticipant = conversation.participants.find(
      (p) => typeof p !== "string" && p._id !== currentUser?._id
    ) as User | undefined;

    return otherParticipant?.avatar || null;
  };

  const isOnline =
    !conversation.isGroup &&
    (
      conversation.participants.find(
        (p) => typeof p !== "string" && p._id !== currentUser?._id
      ) as User
    )?.isOnline;

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <Avatar
          src={getConversationAvatar()}
          alt={getConversationName()}
          isOnline={isOnline}
        />

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getConversationName()}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getConversationStatus()}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <PhoneIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <VideoCameraIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <button
          onClick={() => dispatch(setShowUserProfile({ show: true }))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <InformationCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
