"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
} from "@heroicons/react/24/outline";
import EmojiPicker from "emoji-picker-react";
import { useAppDispatch } from "@/store/hooks";
import { sendMessage } from "@/store/slices/messageSlice";
import { socketService } from "@/services/socket";

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null)||null ;
  const lastTypingRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        socketService.sendTypingStop(conversationId);
      }
    };
  }, [conversationId, isTyping]);

  const handleSend = async () => {
    if (message.trim()) {
      handleTypingStop();
      await dispatch(sendMessage({ conversationId, content: message.trim() }));
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    const now = Date.now();

    // Only send typing event if not already typing or if it's been more than 2 seconds
    if (!isTyping || now - lastTypingRef.current > 500) {
      setIsTyping(true);
      lastTypingRef.current = now;
      socketService.sendTypingStart(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 2000); // Stop typing after 2 seconds of inactivity
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      socketService.sendTypingStop(conversationId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current =  null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTyping();
    } else {
      handleTypingStop();
    }
  };

  const handleEmojiClick = (emojiObject: { emoji: string; }) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    handleTyping(); // Trigger typing when emoji is added
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log("File selected:", file);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            onBlur={handleTypingStop}
            placeholder="Type a message..."
            className="w-full px-4 py-2 pr-12 bg-gray-100 dark:bg-gray-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows={1}
          />

          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FaceSmileIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <PaperClipIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>

          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 right-0 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="w-5 h-5 transform rotate-45" />
        </button>
      </div>
    </div>
  );
}
