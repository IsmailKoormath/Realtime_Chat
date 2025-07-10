"use client";

import { format } from "date-fns";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useAppSelector } from "@/store/hooks";
import { Message as MessageType, User } from "../../../shared/index";
import Avatar from "./Avatar";

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isMe =
    typeof message.sender !== "string" &&
    message.sender._id === currentUser?._id;
  const sender = typeof message.sender === "string" ? null : message.sender;

  return (
    <div
      className={`flex items-end space-x-2 mb-4 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {!isMe && sender && (
        <Avatar src={sender.avatar} alt={sender.username} size="xs" />
      )}

      <div
        className={`flex flex-col ${
          isMe ? "items-end" : "items-start"
        } max-w-[70%]`}
      >
        {!isMe && sender && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">
            {sender.username}
          </span>
        )}

        <div
          className={`relative px-4 py-2 rounded-2xl  break-words ${
            isMe
              ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white ml-auto"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          }`}
        >
          {message.type === "text" && (
            <p className="text-sm">{message.content}</p>
          )}

          {message.type === "image" && (
            <img
              src={message.fileUrl}
              alt="Shared image"
              className="max-w-full rounded-lg"
            />
          )}

          {message.type === "file" && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm underline"
            >
              <span>📎 {message.content}</span>
            </a>
          )}

          <div
            className={`flex items-center space-x-1 mt-1 ${
              isMe ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-xs opacity-70">
              {format(new Date(message.createdAt), "HH:mm")}
            </span>
            {isMe && (
              <span className="text-xs">
                {message.readBy.length > 1 ? (
                  <CheckIcon className="w-4 h-4 text-blue-400 inline" />
                ) : (
                  <CheckIcon className="w-4 h-4 inline" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
