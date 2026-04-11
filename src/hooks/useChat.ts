"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4002';

export interface Participant {
  odiv: string;
  odiv_type: 'user' | 'seller' | 'admin';
  name: string;
  email: string;
  avatar?: string;
  shopId?: string;
  shopName?: string;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  type: 'user_seller' | 'user_admin' | 'seller_admin';
  productId?: string;
  productTitle?: string;
  productImage?: string;
  lastMessage?: {
    content: string;
    messageType: string;
    senderId: string;
    timestamp: string;
  };
  unreadCount: number;
  otherParticipantStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'seller' | 'admin' | 'ai';
  senderName: string;
  senderAvatar?: string;
  messageType: 'text' | 'image' | 'voice' | 'sticker' | 'emoji' | 'system';
  content: string;
  mediaUrl?: string;
  mediaDuration?: number;
  stickerId?: string;
  stickerUrl?: string;
  replyTo?: string;
  isAIGenerated: boolean;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface UserData {
  odiv: string;
  odiv_type: 'user' | 'seller' | 'admin';
  name: string;
  email: string;
  avatar?: string;
  shopId?: string;
  shopName?: string;
}

interface UseChatProps {
  userData: UserData | null;
  enabled?: boolean;
}

export function useChat({ userData, enabled = true }: UseChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [userStatuses, setUserStatuses] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!enabled || !userData) return;

    const newSocket = io(CHAT_SERVICE_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('[Chat] Connected to server');
      setIsConnected(true);
      
      // Authenticate
      newSocket.emit('authenticate', userData);
    });

    newSocket.on('disconnect', () => {
      console.log('[Chat] Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('authenticated', (data: { success: boolean; conversations: Conversation[] }) => {
      if (data.success) {
        console.log('[Chat] Authenticated successfully');
        setConversations(data.conversations);
      }
    });

    newSocket.on('new_conversation', (conversation: Conversation) => {
      setConversations(prev => [conversation, ...prev]);
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv._id === message.conversationId
            ? {
                ...conv,
                lastMessage: {
                  content: message.content,
                  messageType: message.messageType,
                  senderId: message.senderId,
                  timestamp: message.createdAt,
                },
                unreadCount: message.senderId !== userData.odiv ? conv.unreadCount + 1 : conv.unreadCount,
              }
            : conv
        ).sort((a, b) => 
          new Date(b.lastMessage?.timestamp || b.updatedAt).getTime() - 
          new Date(a.lastMessage?.timestamp || a.updatedAt).getTime()
        )
      );
    });

    newSocket.on('conversation_messages', (data: { conversationId: string; messages: Message[] }) => {
      if (data.conversationId === currentConversation?._id) {
        setMessages(data.messages);
      }
      setIsLoading(false);
    });

    newSocket.on('more_messages', (data: { conversationId: string; messages: Message[]; hasMore: boolean }) => {
      setMessages(prev => [...data.messages, ...prev]);
    });

    newSocket.on('user_typing', (data: { odiv: string; name: string; conversationId: string }) => {
      if (data.conversationId === currentConversation?._id) {
        setTypingUsers(prev => new Map(prev).set(data.odiv, data.name));
      }
    });

    newSocket.on('user_stopped_typing', (data: { odiv: string; conversationId: string }) => {
      if (data.conversationId === currentConversation?._id) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.odiv);
          return newMap;
        });
      }
    });

    newSocket.on('user_status_changed', (data: { odiv: string; status: string }) => {
      setUserStatuses(prev => new Map(prev).set(data.odiv, data.status));
      
      // Update conversation status
      setConversations(prev =>
        prev.map(conv => {
          const participant = conv.participants.find(p => p.odiv === data.odiv);
          if (participant) {
            return { ...conv, otherParticipantStatus: data.status };
          }
          return conv;
        })
      );
    });

    newSocket.on('user_statuses', (statuses: Record<string, string>) => {
      setUserStatuses(new Map(Object.entries(statuses)));
    });

    newSocket.on('messages_read', (data: { conversationId: string; readBy: string; messageIds: string[] }) => {
      setMessages(prev =>
        prev.map(msg =>
          data.messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
        )
      );
    });

    newSocket.on('message_deleted', (data: { messageId: string; conversationId: string }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId ? { ...msg, isDeleted: true } : msg
        )
      );
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('[Chat] Error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [enabled, userData]);

  // Join conversation
  const joinConversation = useCallback((conversation: Conversation) => {
    if (!socket || !isConnected) return;

    setCurrentConversation(conversation);
    setMessages([]);
    setIsLoading(true);
    
    socket.emit('join_conversation', conversation._id);

    // Reset unread count
    setConversations(prev =>
      prev.map(conv =>
        conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, [socket, isConnected]);

  // Leave conversation
  const leaveConversation = useCallback(() => {
    if (!socket || !currentConversation) return;

    socket.emit('leave_conversation', currentConversation._id);
    setCurrentConversation(null);
    setMessages([]);
    setTypingUsers(new Map());
  }, [socket, currentConversation]);

  // Start new conversation
  const startConversation = useCallback((data: {
    recipientId: string;
    recipientType: 'user' | 'seller' | 'admin';
    recipientName: string;
    recipientEmail: string;
    recipientAvatar?: string;
    recipientShopId?: string;
    recipientShopName?: string;
    productId?: string;
    productTitle?: string;
    productImage?: string;
    initialMessage?: string;
  }) => {
    if (!socket || !isConnected) return;

    socket.emit('start_conversation', data);
  }, [socket, isConnected]);

  // Send message
  const sendMessage = useCallback((data: {
    messageType: 'text' | 'image' | 'voice' | 'sticker' | 'emoji';
    content: string;
    mediaUrl?: string;
    mediaDuration?: number;
    mediaSize?: number;
    stickerId?: string;
    stickerUrl?: string;
    replyTo?: string;
  }) => {
    if (!socket || !isConnected || !currentConversation) return;

    socket.emit('send_message', {
      conversationId: currentConversation._id,
      ...data,
    });

    // Stop typing indicator
    socket.emit('typing_stop', currentConversation._id);
  }, [socket, isConnected, currentConversation]);

  // Typing indicator
  const sendTypingStart = useCallback(() => {
    if (!socket || !currentConversation) return;

    socket.emit('typing_start', currentConversation._id);

    // Auto-stop after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', currentConversation._id);
    }, 3000);
  }, [socket, currentConversation]);

  const sendTypingStop = useCallback(() => {
    if (!socket || !currentConversation) return;

    socket.emit('typing_stop', currentConversation._id);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [socket, currentConversation]);

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    if (!socket || !currentConversation || messageIds.length === 0) return;

    socket.emit('mark_read', {
      conversationId: currentConversation._id,
      messageIds,
    });
  }, [socket, currentConversation]);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    if (!socket) return;

    socket.emit('delete_message', messageId);
  }, [socket]);

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    if (!socket || !currentConversation || messages.length === 0) return;

    const oldestMessage = messages[0];
    socket.emit('load_more_messages', {
      conversationId: currentConversation._id,
      before: oldestMessage.createdAt,
    });
  }, [socket, currentConversation, messages]);

  // Get user status
  const getUserStatus = useCallback((odiv: string) => {
    return userStatuses.get(odiv) || 'offline';
  }, [userStatuses]);

  // Request user statuses
  const requestUserStatuses = useCallback((odivList: string[]) => {
    if (!socket || !isConnected) return;

    socket.emit('get_user_status', odivList);
  }, [socket, isConnected]);

  return {
    isConnected,
    conversations,
    currentConversation,
    messages,
    typingUsers,
    isLoading,
    joinConversation,
    leaveConversation,
    startConversation,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    markAsRead,
    deleteMessage,
    loadMoreMessages,
    getUserStatus,
    requestUserStatuses,
  };
}
