"use client";

import React, { useCallback } from 'react';
import type { Conversation, Message, UserStatus, SendMessageData } from '@/types/chat';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatViewProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  participantStatus?: UserStatus;
  typingUsers: Map<string, string>;
  isLoading: boolean;
  hasMore: boolean;
  onBack?: () => void;
  onSendMessage: (data: SendMessageData) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onMarkAsRead: (messageIds: string[]) => void;
  onDeleteMessage?: (messageId: string) => void;
  onLoadMore: () => void;
  disabled?: boolean;
}

export default function ChatView({
  conversation,
  messages,
  currentUserId,
  participantStatus,
  typingUsers,
  isLoading,
  hasMore,
  onBack,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onMarkAsRead,
  onDeleteMessage,
  onLoadMore,
  disabled = false,
}: ChatViewProps) {
  const handleSend = useCallback((data: SendMessageData) => {
    onSendMessage(data);
  }, [onSendMessage]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        currentUserId={currentUserId}
        participantStatus={participantStatus}
        onBack={onBack}
      />

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        onMarkAsRead={onMarkAsRead}
        onDeleteMessage={onDeleteMessage}
      />

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        disabled={disabled}
        placeholder={`Message ${conversation.participants.find(p => p.odiv !== currentUserId)?.name || ''}`}
      />
    </div>
  );
}
