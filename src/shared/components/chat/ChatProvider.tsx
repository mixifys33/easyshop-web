"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type {
  UserData,
  Conversation,
  Message,
  UserStatus,
  SendMessageData,
  StartConversationData,
  NotificationSettings,
  AIHandledConversation,
} from '@/types/chat';

interface ChatContextValue {
  isConnected: boolean;
  isAuthenticated: boolean;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  typingUsers: Map<string, string>;
  userStatuses: Map<string, UserStatus>;
  isLoading: boolean;
  hasMoreMessages: boolean;
  totalUnreadCount: number;
  notificationSettings: NotificationSettings;
  aiHandledConversations: AIHandledConversation[];
  joinConversation: (conversation: Conversation) => void;
  leaveConversation: () => void;
  startConversation: (data: StartConversationData) => void;
  sendMessage: (data: SendMessageData) => void;
  sendTypingStart: () => void;
  sendTypingStop: () => void;
  markAsRead: (messageIds: string[]) => void;
  deleteMessage: (messageId: string) => void;
  loadMoreMessages: () => void;
  getUserStatus: (userId: string) => UserStatus | undefined;
  requestUserStatuses: (userIds: string[]) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  clearAIHandledConversations: () => void;
  getUnreadCount: (conversationId: string) => number;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
  userData: UserData | null;
  enabled?: boolean;
}

export default function ChatProvider({ children }: ChatProviderProps) {
  const [conversations] = useState<Conversation[]>([]);
  const [activeConversation] = useState<Conversation | null>(null);
  const [messages] = useState<Message[]>([]);
  const [notificationSettings] = useState<NotificationSettings>({
    soundEnabled: true,
    browserNotificationsEnabled: true,
  });

  const noop = useCallback(() => {}, []);

  const value: ChatContextValue = {
    isConnected: false,
    isAuthenticated: false,
    conversations,
    activeConversation,
    messages,
    typingUsers: new Map(),
    userStatuses: new Map(),
    isLoading: false,
    hasMoreMessages: false,
    totalUnreadCount: 0,
    notificationSettings,
    aiHandledConversations: [],
    joinConversation: noop,
    leaveConversation: noop,
    startConversation: noop,
    sendMessage: noop,
    sendTypingStart: noop,
    sendTypingStop: noop,
    markAsRead: noop,
    deleteMessage: noop,
    loadMoreMessages: noop,
    getUserStatus: () => undefined,
    requestUserStatuses: noop,
    updateNotificationSettings: noop,
    clearAIHandledConversations: noop,
    getUnreadCount: () => 0,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
