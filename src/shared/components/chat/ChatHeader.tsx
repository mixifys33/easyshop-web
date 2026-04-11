"use client";

import React from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Shield, Bot } from 'lucide-react';
import type { Conversation, UserData, UserStatus } from '@/types/chat';
import StatusIndicator from './StatusIndicator';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  participantStatus?: UserStatus;
  onBack?: () => void;
  onViewProfile?: () => void;
}

export default function ChatHeader({
  conversation,
  currentUserId,
  participantStatus,
  onBack,
  onViewProfile,
}: ChatHeaderProps) {
  const otherParticipant = conversation.participants.find(p => p.odiv !== currentUserId);
  const isAdmin = otherParticipant?.odiv_type === 'admin';

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
      {/* Back button (mobile) */}
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Avatar */}
      <button
        onClick={onViewProfile}
        className="relative flex-shrink-0"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold overflow-hidden">
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
        {participantStatus && (
          <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white rounded-full">
            <StatusIndicator status={participantStatus.status} size="sm" />
          </div>
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {otherParticipant?.name || 'Unknown'}
          </h3>
          {isAdmin && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {participantStatus && (
            <StatusIndicator
              status={participantStatus.status}
              lastSeen={participantStatus.lastSeen}
              size="sm"
              showText
            />
          )}
          {participantStatus?.status === 'offline_with_ai' && (
            <span className="flex items-center gap-1 text-xs text-purple-500">
              <Bot className="w-3 h-3" />
              AI responding
            </span>
          )}
        </div>
        {/* Product context */}
        {conversation.productTitle && (
          <div className="flex items-center gap-2 mt-0.5">
            {conversation.productImage && (
              <img
                src={conversation.productImage}
                alt=""
                className="w-5 h-5 rounded object-cover"
              />
            )}
            <span className="text-xs text-gray-400 truncate">
              {conversation.productTitle}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition hidden sm:block"
          aria-label="Voice call"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition hidden sm:block"
          aria-label="Video call"
        >
          <Video className="w-5 h-5" />
        </button>
        <button
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
