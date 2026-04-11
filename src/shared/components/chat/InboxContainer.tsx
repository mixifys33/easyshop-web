"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { Conversation, UserData, ProductContext, SendMessageData } from '@/types/chat';
import { useChatContext } from './ChatProvider';
import ConversationList from './ConversationList';
import ChatView from './ChatView';
import { MessageCircle } from 'lucide-react';

interface InboxContainerProps {
  userType: 'user' | 'seller' | 'admin';
  userData: UserData;
  initialConversationId?: string;
  productContext?: ProductContext;
  recipientId?: string;
  recipientType?: 'user' | 'seller' | 'admin';
  recipientName?: string;
  recipientEmail?: string;
  recipientShopId?: string;
  recipientShopName?: string;
  autoStarted?: boolean; // Indicates conversation was auto-started from product page
}

export default function InboxContainer({
  userType,
  userData,
  initialConversationId,
  productContext,
  recipientId,
  recipientType,
  recipientName,
  recipientEmail,
  recipientShopId,
  recipientShopName,
  autoStarted = false,
}: InboxContainerProps) {
  const {
    isConnected,
    isAuthenticated,
    conversations,
    activeConversation,
    messages,
    typingUsers,
    userStatuses,
    isLoading,
    hasMoreMessages,
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
  } = useChatContext();

  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Check viewport size
  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setShowConversationList(true);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // When conversation is auto-started or active conversation changes, show chat on mobile
  useEffect(() => {
    if (isMobileView && activeConversation && (autoStarted || recipientId)) {
      setShowConversationList(false);
    }
  }, [isMobileView, activeConversation, autoStarted, recipientId]);

  // Handle initial conversation selection (when coming from URL with conversation ID)
  useEffect(() => {
    if (!isAuthenticated) return;

    // If there's a specific conversation to open from URL
    if (initialConversationId) {
      const conv = conversations.find(c => c._id === initialConversationId);
      if (conv && activeConversation?._id !== initialConversationId) {
        joinConversation(conv);
        if (isMobileView) {
          setShowConversationList(false);
        }
      }
    }
  }, [
    isAuthenticated,
    initialConversationId,
    conversations,
    joinConversation,
    isMobileView,
    activeConversation?._id,
  ]);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    joinConversation(conversation);
    if (isMobileView) {
      setShowConversationList(false);
    }
  }, [joinConversation, isMobileView]);

  const handleBack = useCallback(() => {
    leaveConversation();
    setShowConversationList(true);
  }, [leaveConversation]);

  const handleSendMessage = useCallback((data: SendMessageData) => {
    sendMessage(data);
  }, [sendMessage]);

  const handleMarkAsRead = useCallback((messageIds: string[]) => {
    markAsRead(messageIds);
  }, [markAsRead]);

  // Get participant status for active conversation
  const getParticipantStatus = () => {
    if (!activeConversation) return undefined;
    const otherParticipant = activeConversation.participants.find(
      p => p.odiv !== userData.odiv
    );
    if (!otherParticipant) return undefined;
    return getUserStatus(otherParticipant.odiv);
  };

  // Connection status banner - Only show if not authenticated after 3 seconds
  // Since chat is preloaded in background, we don't show "Connecting..." immediately
  const [showConnecting, setShowConnecting] = React.useState(false);
  
  React.useEffect(() => {
    if (!isConnected || !isAuthenticated) {
      // Show connecting message only after 3 seconds delay
      const timer = setTimeout(() => {
        if (!isConnected || !isAuthenticated) {
          setShowConnecting(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowConnecting(false);
    }
  }, [isConnected, isAuthenticated]);

  if ((!isConnected || !isAuthenticated) && showConnecting) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
            <MessageCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Connecting to chat...</h3>
          <p className="text-sm text-gray-500 mt-2">
            This is taking longer than expected. Please check your internet connection.
          </p>
        </div>
      </div>
    );
  }

  // Mobile layout
  if (isMobileView) {
    return (
      <div className="h-full">
        {showConversationList ? (
          <ConversationList
            conversations={conversations}
            selectedId={activeConversation?._id}
            onSelect={handleSelectConversation}
            loading={!isAuthenticated}
            currentUserId={userData.odiv}
            userStatuses={userStatuses}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            emptyMessage={
              userType === 'user'
                ? 'Start chatting with sellers'
                : userType === 'seller'
                ? 'No customer messages yet'
                : 'No conversations to moderate'
            }
          />
        ) : activeConversation ? (
          <ChatView
            conversation={activeConversation}
            messages={messages}
            currentUserId={userData.odiv}
            participantStatus={getParticipantStatus()}
            typingUsers={typingUsers}
            isLoading={isLoading}
            hasMore={hasMoreMessages}
            onBack={handleBack}
            onSendMessage={handleSendMessage}
            onTypingStart={sendTypingStart}
            onTypingStop={sendTypingStop}
            onMarkAsRead={handleMarkAsRead}
            onDeleteMessage={deleteMessage}
            onLoadMore={loadMoreMessages}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Select a conversation</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop split layout
  return (
    <div className="h-full flex">
      {/* Conversation List - Left Panel */}
      <div className="w-80 lg:w-96 flex-shrink-0 border-r border-gray-200">
        <ConversationList
          conversations={conversations}
          selectedId={activeConversation?._id}
          onSelect={handleSelectConversation}
          loading={!isAuthenticated}
          currentUserId={userData.odiv}
          userStatuses={userStatuses}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          emptyMessage={
            userType === 'user'
              ? 'Start chatting with sellers'
              : userType === 'seller'
              ? 'No customer messages yet'
              : 'No conversations to moderate'
          }
        />
      </div>

      {/* Chat View - Right Panel */}
      <div className="flex-1">
        {activeConversation ? (
          <ChatView
            conversation={activeConversation}
            messages={messages}
            currentUserId={userData.odiv}
            participantStatus={getParticipantStatus()}
            typingUsers={typingUsers}
            isLoading={isLoading}
            hasMore={hasMoreMessages}
            onSendMessage={handleSendMessage}
            onTypingStart={sendTypingStart}
            onTypingStop={sendTypingStop}
            onMarkAsRead={handleMarkAsRead}
            onDeleteMessage={deleteMessage}
            onLoadMore={loadMoreMessages}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">Your Messages</h3>
            <p className="text-gray-500 mt-2 text-center max-w-sm">
              {userType === 'user'
                ? 'Select a conversation or start chatting with a seller from a product page'
                : userType === 'seller'
                ? 'Select a conversation to respond to your customers'
                : 'Select a conversation to monitor or moderate'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
