"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { format, isValid, parseISO, isSameDay } from "date-fns";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchMessages } from "@/store/slices/messageSlice";
import { Message as MessageType } from "../../../shared/index";
import Message from "./Message";

interface MessageListProps {
  messages: MessageType[];
  conversationId: string;
}

export default function MessageList({
  messages,
  conversationId,
}: MessageListProps) {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView();
  const hasMore = useAppSelector(
    (state) => state.messages.hasMore[conversationId]
  );
  const isLoading = useAppSelector(
    (state) => state.messages.isLoading[conversationId]
  );
  const currentPage = useRef(1);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      currentPage.current += 1;
      dispatch(fetchMessages({ conversationId, page: currentPage.current }));
    }
  }, [inView, hasMore, isLoading, conversationId, dispatch]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const groupMessagesByDate = (messages: MessageType[]) => {
    const groups: { [key: string]: MessageType[] } = {};

    messages.forEach((message) => {
      try {
        const date = parseISO(message.createdAt);
        if (!isValid(date)) return;

        const dateKey = format(date, "yyyy-MM-dd");
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(message);
      } catch (error) {
        console.error("Invalid message date:", message.createdAt, error);
      }
    });

    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid Date";

      if (isSameDay(date, new Date())) {
        return "Today";
      }

      return format(date, "EEEE, MMMM d");
    } catch (error) {
      console.log(error)
      return "Invalid Date" ;
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="relative h-full overflow-y-auto p-4 space-y-4 chat-scrollbar">
      {hasMore && (
        <div ref={loadMoreRef} className="text-center py-2">
          {isLoading && (
            <div className="inline-flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce animation-delay-400"></div>
            </div>
          )}
        </div>
      )}

      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date}>
          <div className="flex items-center justify-center mb-4">
            <span className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full">
              {formatDateHeader(date)}
            </span>
          </div>
          {dateMessages.map((message) => (
            <Message key={message._id} message={message} />
          ))}
        </div>
      ))}

      <div ref={scrollRef} />
    </div>
  );
}
