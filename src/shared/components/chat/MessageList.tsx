"use client";

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import type { Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: Map<string, string>;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMarkAsRead: (messageIds: string[]) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export default function MessageList({
  messages,
  currentUserId,
  typingUsers,
  isLoading,
  hasMore,
  onLoadMore,
  onMarkAsRead,
  onDeleteMessage,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const lastMessageRef = useRef<string | null>(null);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage._id !== lastMessageRef.current) {
      lastMessageRef.current = lastMessage._id;
      
      if (autoScroll || lastMessage.senderId === currentUserId) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
  }, [messages, currentUserId, autoScroll]);

  // Mark unread messages as read with debounce
  useEffect(() => {
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }

    markAsReadTimeoutRef.current = setTimeout(() => {
      const unreadIds = messages
        .filter(msg => !msg.isRead && msg.senderId !== currentUserId)
        .map(msg => msg._id);

      if (unreadIds.length > 0) {
        onMarkAsRead(unreadIds);
      }
    }, 500); // Debounce by 500ms

    return () => {
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }
    };
  }, [messages, currentUserId, onMarkAsRead]);

  // Handle scroll with throttling
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Show scroll button when scrolled up
    setShowScrollButton(distanceFromBottom > 100);
    setAutoScroll(distanceFromBottom < 50);

    // Load more when scrolled to top
    if (scrollTop < 50 && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
  }, []);

  // Memoize grouped messages for performance
  const groupedMessages = useMemo(() => {
    return messages.reduce((groups, message) => {
      const date = new Date(message.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {} as Record<string, Message[]>);
  }, [messages]);

  // Determine if avatar should be shown
  const shouldShowAvatar = useCallback((message: Message, index: number, dayMessages: Message[]) => {
    if (message.senderId === currentUserId) return false;
    if (index === 0) return true;
    const prevMessage = dayMessages[index - 1];
    return prevMessage.senderId !== message.senderId;
  }, [currentUserId]);

  const typingNames = useMemo(() => Array.from(typingUsers.values()), [typingUsers]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4 scroll-smooth"
      role="log"
      aria-label="Message history"
      aria-live="polite"
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Load more indicator */}
      {hasMore && !isLoading && (
        <div className="flex justify-center py-2">
          <button
            onClick={onLoadMore}
            className="text-xs sm:text-sm text-blue-500 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
          >
            Load earlier messages
          </button>
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-3 sm:my-4">
            <div className="px-2.5 sm:px-3 py-1 bg-gray-100 rounded-full text-[10px] sm:text-xs text-gray-500">
              {date}
            </div>
          </div>

          {/* Messages for this date */}
          {dayMessages.map((message, index) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.senderId === currentUserId}
              showAvatar={shouldShowAvatar(message, index, dayMessages)}
              onDelete={onDeleteMessage}
            />
          ))}
        </div>
      ))}

      {/* Typing indicator */}
      {typingNames.length > 0 && (
        <TypingIndicator names={typingNames} />
      )}

      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12 px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm sm:text-base">No messages yet</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />

      {/* Scroll to bottom button - positioned relative to container */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 sm:bottom-24 right-3 sm:right-6 p-2 sm:p-3 bg-white shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 transition z-10"
          aria-label="Scroll to latest messages"
        >
          <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}
