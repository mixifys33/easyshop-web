"use client";

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface StatusIndicatorProps {
  status: 'online' | 'online_in_chat' | 'offline' | 'offline_with_ai';
  lastSeen?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function StatusIndicator({
  status,
  lastSeen,
  size = 'md',
  showText = false,
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          dotClass: 'bg-green-500',
          text: 'Online',
          animate: true,
        };
      case 'online_in_chat':
        return {
          dotClass: 'bg-green-500',
          text: 'Active now',
          animate: true,
        };
      case 'offline_with_ai':
        return {
          dotClass: 'bg-purple-500',
          text: 'AI Available',
          animate: false,
        };
      case 'offline':
      default:
        return {
          dotClass: 'bg-gray-400',
          text: lastSeen
            ? `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
            : 'Offline',
          animate: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex">
        <span
          className={`${sizeClasses[size]} rounded-full ${config.dotClass} ${
            config.animate ? 'animate-pulse' : ''
          }`}
        />
        {config.animate && (
          <span
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full ${config.dotClass} animate-ping opacity-75`}
          />
        )}
      </span>
      {showText && (
        <span className="text-xs text-gray-500">{config.text}</span>
      )}
    </div>
  );
}
