"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, X, Upload, RotateCcw } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (url: string, size: number) => void;
  onCancel: () => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4002';

export default function ImageUploader({
  onUpload,
  onCancel,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          onUpload(response.url, selectedFile.size);
        } else {
          setError('Upload failed. Please try again.');
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        setError('Upload failed. Please check your connection.');
        setIsUploading(false);
      };

      xhr.open('POST', `${CHAT_SERVICE_URL}/api/chat/upload`);
      xhr.send(formData);
    } catch (err) {
      setError('Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleUpload();
  };

  const handleClear = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Send Image</h3>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">Click or drag image here</p>
          <p className="text-sm text-gray-400 mt-1">
            Max {maxSizeMB}MB - JPG, PNG, GIF, WebP
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={preview!}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            {!isUploading && (
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            </div>
          )}

          {/* Actions */}
          {!isUploading && !error && (
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
