"use client";

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation, UserData, UserStatus } from '@/types/chat';
import StatusIndicator from './StatusIndicator';
import UnreadBadge from './UnreadBadge';
import { Image, Mic, Sticker, Shield, Bot } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isSelected: boolean;
  onClick: () => void;
  participantStatus?: UserStatus;
}

export default function ConversationItem({
  conversation,
  currentUserId,
  isSelected,
  onClick,
  participantStatus,
}: ConversationItemProps) {
  const otherParticipant = conversation.participants.find(p => p.odiv !== currentUserId);
  const unreadCount = conversation.unreadCount?.find(u => u.odiv === currentUserId)?.count || 0;
  const isAdmin = conversation.type === 'user_admin' || conversation.type === 'seller_admin';

  const getLastMessagePreview = () => {
    const lastMsg = conversation.lastMessage;
    if (!lastMsg) return 'No messages yet';

    const isOwnMessage = lastMsg.senderId === currentUserId;
    const prefix = isOwnMessage ? 'You: ' : '';

    switch (lastMsg.messageType) {
      case 'image':
        return (
          <span className="flex items-center gap-1">
            {prefix}<Image className="w-3 h-3" /> Photo
          </span>
        );
      case 'voice':
        return (
          <span className="flex items-center gap-1">
            {prefix}<Mic className="w-3 h-3" /> Voice message
          </span>
        );
      case 'sticker':
        return (
          <span className="flex items-center gap-1">
            {prefix}<Sticker className="w-3 h-3" /> Sticker
          </span>
        );
      case 'emoji':
        return `${prefix}${lastMsg.content}`;
      default:
        return `${prefix}${lastMsg.content.slice(0, 40)}${lastMsg.content.length > 40 ? '...' : ''}`;
    }
  };

  const getTimeDisplay = () => {
    const timestamp = conversation.lastMessage?.timestamp || conversation.updatedAt;
    return formatDistanceToNow(new Date(timestamp), { addSuffix: false });
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 transition rounded-xl text-left ${
        isSelected
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
      aria-label={`Conversation with ${otherParticipant?.name || 'Unknown'}`}
      aria-selected={isSelected}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
          {otherParticipant?.avatar ? (
            <img
              src={otherParticipant.avatar}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            otherParticipant?.name?.charAt(0).toUpperCase() || '?'
          )}
        </div>
        {/* Status indicator */}
        {participantStatus && (
          <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white rounded-full">
            <StatusIndicator status={participantStatus.status} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {otherParticipant?.name || 'Unknown'}
            </h3>
            {/* Admin Badge */}
            {isAdmin && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
            {/* Shop name for sellers */}
            {otherParticipant?.shopName && (
              <span className="text-xs text-gray-400 truncate hidden sm:inline">
                {otherParticipant.shopName}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {getTimeDisplay()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
            {getLastMessagePreview()}
          </p>
          <UnreadBadge count={unreadCount} size="sm" />
        </div>
        {/* Product context */}
        {conversation.productTitle && (
          <div className="flex items-center gap-2 mt-1">
            {conversation.productImage && (
              <img
                src={conversation.productImage}
                alt=""
                className="w-6 h-6 rounded object-cover"
              />
            )}
            <span className="text-xs text-gray-400 truncate">
              Re: {conversation.productTitle}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
