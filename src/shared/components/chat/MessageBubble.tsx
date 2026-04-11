"use client";

import React, { useState } from 'react';
import { Check, CheckCheck, Bot, Shield, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '@/types/chat';
import VoiceMessage from './VoiceMessage';
import ImageLightbox from './ImageLightbox';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onImageClick?: (url: string) => void;
  onDelete?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  onImageClick,
  onDelete,
}: MessageBubbleProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [showActions, setShowActions] = useState(false);

  if (message.isDeleted) {
    return (
      <div
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
        role="listitem"
        aria-label="Deleted message"
      >
        <div className="px-4 py-2 bg-gray-100 text-gray-400 italic rounded-2xl text-sm">
          This message was deleted
        </div>
      </div>
    );
  }

  // System message
  if (message.messageType === 'system') {
    return (
      <div className="flex justify-center my-4" role="listitem" aria-label="System message">
        <div className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <>
            <div
              className="relative cursor-pointer rounded-xl overflow-hidden max-w-[240px]"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={message.mediaUrl}
                alt="Shared image"
                className="w-full h-auto max-h-[300px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition" />
            </div>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
            <ImageLightbox
              imageUrl={message.mediaUrl || ''}
              isOpen={showLightbox}
              onClose={() => setShowLightbox(false)}
              alt="Shared image"
            />
          </>
        );

      case 'voice':
        return (
          <VoiceMessage
            url={message.mediaUrl || ''}
            duration={message.mediaDuration || 0}
            isOwn={isOwn}
          />
        );

      case 'sticker':
        return (
          <div className="w-24 h-24">
            {message.stickerUrl ? (
              <img
                src={message.stickerUrl}
                alt={message.content || 'Sticker'}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-4xl">
                {message.content}
              </div>
            )}
          </div>
        );

      case 'emoji':
        return (
          <span className="text-4xl">{message.content}</span>
        );

      case 'text':
      default:
        return (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        );
    }
  };

  const bubbleClass = isOwn
    ? 'bg-blue-500 text-white rounded-2xl rounded-br-md'
    : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md';

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}
      role="listitem"
      aria-label={`Message from ${message.senderName}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
            {message.senderAvatar ? (
              <img src={message.senderAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              message.senderName.charAt(0).toUpperCase()
            )}
          </div>
        )}
        {!showAvatar && !isOwn && <div className="w-8" />}

        <div className="flex flex-col">
          {/* Sender name for group chats */}
          {!isOwn && showAvatar && (
            <span className="text-xs text-gray-500 ml-1 mb-0.5">{message.senderName}</span>
          )}

          {/* Message bubble */}
          <div className={`relative px-4 py-2 ${bubbleClass}`}>
            {/* AI Badge */}
            {message.isAIGenerated && (
              <div className="flex items-center gap-1 text-xs mb-1 opacity-80">
                <Bot className="w-3 h-3" />
                <span>AI Response</span>
              </div>
            )}

            {/* Admin Badge */}
            {message.senderType === 'admin' && (
              <div className={`flex items-center gap-1 text-xs mb-1 ${isOwn ? 'text-blue-100' : 'text-amber-600'}`}>
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </div>
            )}

            {renderContent()}

            {/* Time and read status */}
            <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
              <span className="text-[10px]">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: false })}
              </span>
              {isOwn && (
                message.isRead ? (
                  <CheckCheck className="w-3.5 h-3.5" aria-label="Read" />
                ) : (
                  <Check className="w-3.5 h-3.5" aria-label="Sent" />
                )
              )}
            </div>
          </div>

          {/* Delete button */}
          {isOwn && showActions && onDelete && (
            <button
              onClick={() => onDelete(message._id)}
              className="self-end mt-1 p-1 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
              aria-label="Delete message"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
