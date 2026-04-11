"use client";

import React from 'react';
import { RefreshCw, X, AlertCircle, Image as ImageIcon, Mic } from 'lucide-react';

interface UploadRetryButtonProps {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
  uploadType: 'image' | 'voice';
  isRetrying?: boolean;
}

export default function UploadRetryButton({
  error,
  onRetry,
  onCancel,
  uploadType,
  isRetrying = false,
}: UploadRetryButtonProps) {
  const Icon = uploadType === 'image' ? ImageIcon : Mic;

  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
      <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
        <Icon className="w-5 h-5 text-red-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Upload failed</span>
        </div>
        <p className="text-xs text-red-600 mt-0.5 truncate" title={error}>
          {error || `Failed to upload ${uploadType}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Retry ${uploadType} upload`}
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </button>
        <button
          onClick={onCancel}
          disabled={isRetrying}
          className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
          aria-label="Cancel upload"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
