"use client";

import React from 'react';

interface UnreadBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function UnreadBadge({ count, size = 'md' }: UnreadBadgeProps) {
  if (count <= 0) return null;

  const sizeClasses = {
    sm: 'min-w-[16px] h-4 text-[10px] px-1',
    md: 'min-w-[20px] h-5 text-xs px-1.5',
    lg: 'min-w-[24px] h-6 text-sm px-2',
  };

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <span
      className={`${sizeClasses[size]} inline-flex items-center justify-center bg-red-500 text-white font-semibold rounded-full`}
      aria-label={`${count} unread messages`}
    >
      {displayCount}
    </span>
  );
}
