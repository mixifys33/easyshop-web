"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile, Image as ImageIcon, Mic, Sticker, Paperclip } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';
import VoiceRecorderAdvanced from './VoiceRecorderAdvanced';
import ImageUploader from './ImageUploader';

interface MessageInputProps {
  onSend: (data: {
    messageType: 'text' | 'image' | 'voice' | 'sticker' | 'emoji';
    content: string;
    mediaUrl?: string;
    mediaDuration?: number;
    mediaSize?: number;
    stickerId?: string;
    stickerUrl?: string;
  }) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
  placeholder?: string;
}

type ActivePicker = 'none' | 'emoji' | 'sticker' | 'voice' | 'image';

export default function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [activePicker, setActivePicker] = useState<ActivePicker>('none');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop();
    }, 2000);
  }, [isTyping, onTypingStart, onTypingStop]);

  // Clean up typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendText = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Check if it's just an emoji
    const emojiRegex = /^[\p{Emoji}]+$/u;
    const messageType = emojiRegex.test(trimmedMessage) && trimmedMessage.length <= 8 ? 'emoji' : 'text';

    onSend({
      messageType,
      content: trimmedMessage,
    });

    setMessage('');
    setIsTyping(false);
    onTypingStop();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleStickerSelect = (sticker: { id: string; url: string; name: string }) => {
    onSend({
      messageType: 'sticker',
      content: sticker.name,
      stickerId: sticker.id,
      stickerUrl: sticker.url,
    });
    setActivePicker('none');
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice-message.webm');

      const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4002';
      const response = await fetch(`${CHAT_SERVICE_URL}/api/chat/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      onSend({
        messageType: 'voice',
        content: 'Voice message',
        mediaUrl: data.url,
        mediaDuration: duration,
        mediaSize: audioBlob.size,
      });
    } catch (error) {
      console.error('Failed to upload voice message:', error);
    }

    setActivePicker('none');
  };

  const handleImageUpload = (url: string, size: number) => {
    onSend({
      messageType: 'image',
      content: '',
      mediaUrl: url,
      mediaSize: size,
    });
    setActivePicker('none');
  };

  const togglePicker = (picker: ActivePicker) => {
    setActivePicker(prev => prev === picker ? 'none' : picker);
  };

  return (
    <div className="relative border-t border-gray-200 bg-white p-2 sm:p-3">
      {/* Pickers */}
      <div className="relative">
        {activePicker === 'emoji' && (
          <EmojiPicker
            isOpen={true}
            onClose={() => setActivePicker('none')}
            onSelect={handleEmojiSelect}
          />
        )}
        {activePicker === 'sticker' && (
          <StickerPicker
            isOpen={true}
            onClose={() => setActivePicker('none')}
            onSelect={handleStickerSelect}
          />
        )}
        {activePicker === 'image' && (
          <div className="absolute bottom-full left-0 mb-2 z-50">
            <ImageUploader
              onUpload={handleImageUpload}
              onCancel={() => setActivePicker('none')}
            />
          </div>
        )}
      </div>

      {/* Voice Recorder (Full width when active) */}
      {activePicker === 'voice' ? (
        <VoiceRecorderAdvanced
          onSend={handleVoiceSend}
          onCancel={() => setActivePicker('none')}
        />
      ) : (
        <div className="flex items-end gap-1 sm:gap-2">
          {/* Action buttons - hidden on very small screens, shown as single menu */}
          <div className="hidden xs:flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={() => togglePicker('emoji')}
              className={`p-1.5 sm:p-2 rounded-full transition ${
                activePicker === 'emoji'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Emoji picker"
              disabled={disabled}
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => togglePicker('sticker')}
              className={`p-1.5 sm:p-2 rounded-full transition hidden sm:block ${
                activePicker === 'sticker'
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Sticker picker"
              disabled={disabled}
            >
              <Sticker className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => togglePicker('image')}
              className={`p-1.5 sm:p-2 rounded-full transition ${
                activePicker === 'image'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Send image"
              disabled={disabled}
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Mobile: Single attachment button */}
          <div className="xs:hidden">
            <button
              onClick={() => togglePicker('image')}
              className={`p-1.5 rounded-full transition ${
                activePicker === 'image'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              aria-label="Attach"
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full resize-none rounded-2xl border border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 pr-8 sm:pr-10 text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
              aria-label="Message input"
            />
          </div>

          {/* Send / Voice button */}
          {message.trim() ? (
            <button
              onClick={handleSendText}
              disabled={disabled}
              className="p-2 sm:p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:opacity-50 flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <button
              onClick={() => togglePicker('voice')}
              disabled={disabled}
              className="p-2 sm:p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition disabled:opacity-50 flex-shrink-0"
              aria-label="Record voice message"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
