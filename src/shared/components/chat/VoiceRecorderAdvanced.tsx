"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Send, X, Play, Pause, Lock, Trash2 } from 'lucide-react';

interface VoiceRecorderAdvancedProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'preview';
type SwipeDirection = 'none' | 'left' | 'right' | 'up' | 'down';

export default function VoiceRecorderAdvanced({
  onSend,
  onCancel,
  maxDuration = 300,
}: VoiceRecorderAdvancedProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>('none');
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 50;

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl]);

  // Auto-stop at max duration
  useEffect(() => {
    if (duration >= maxDuration && recordingState === 'recording') {
      stopRecording();
    }
  }, [duration, maxDuration, recordingState]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecordingState('preview');
      };

      mediaRecorder.start(100);
      setRecordingState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [recordingState]);

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setRecordingState('idle');
    setIsHandsFree(false);
    onCancel();
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
      setRecordingState('idle');
      setIsHandsFree(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const enableHandsFree = () => {
    setIsHandsFree(true);
  };

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (recordingState !== 'recording' && recordingState !== 'paused') return;

    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    setSwipeOffset({ x: deltaX, y: deltaY });

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > SWIPE_THRESHOLD) {
        setSwipeDirection('right'); // Cancel
      } else if (deltaX < -SWIPE_THRESHOLD) {
        setSwipeDirection('left'); // Pause
      } else {
        setSwipeDirection('none');
      }
    } else {
      if (deltaY < -SWIPE_THRESHOLD) {
        setSwipeDirection('up'); // Hands-free
      } else if (deltaY > SWIPE_THRESHOLD) {
        setSwipeDirection('down'); // Send
      } else {
        setSwipeDirection('none');
      }
    }
  };

  const handleTouchEnd = () => {
    // Execute swipe action
    switch (swipeDirection) {
      case 'right':
        cancelRecording();
        break;
      case 'left':
        if (recordingState === 'recording') {
          pauseRecording();
        } else if (recordingState === 'paused') {
          resumeRecording();
        }
        break;
      case 'up':
        enableHandsFree();
        break;
      case 'down':
        stopRecording();
        break;
    }

    setSwipeDirection('none');
    setSwipeOffset({ x: 0, y: 0 });
  };

  // Mouse handlers for desktop
  const handleMouseDown = () => {
    if (recordingState === 'idle') {
      startRecording();
    }
  };

  const handleMouseUp = () => {
    if (recordingState === 'recording' && !isHandsFree) {
      stopRecording();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Idle state
  if (recordingState === 'idle') {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
        >
          <Mic className="w-5 h-5" />
          <span className="font-medium">Hold to Record</span>
        </button>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
        <p className="text-xs text-gray-400 ml-auto">
          Swipe: ← pause | → cancel | ↑ hands-free | ↓ send
        </p>
      </div>
    );
  }

  // Recording / Paused state
  if (recordingState === 'recording' || recordingState === 'paused') {
    return (
      <div
        ref={containerRef}
        className={`relative flex items-center gap-3 p-3 rounded-xl transition-all ${
          swipeDirection === 'right' ? 'bg-red-100' :
          swipeDirection === 'left' ? 'bg-yellow-100' :
          swipeDirection === 'up' ? 'bg-purple-100' :
          swipeDirection === 'down' ? 'bg-green-100' :
          'bg-gray-50'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translate(${swipeOffset.x * 0.3}px, ${swipeOffset.y * 0.3}px)`,
        }}
      >
        {/* Swipe indicators */}
        {swipeDirection !== 'none' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {swipeDirection === 'right' && (
              <div className="flex items-center gap-2 text-red-500">
                <Trash2 className="w-6 h-6" />
                <span className="font-medium">Release to Cancel</span>
              </div>
            )}
            {swipeDirection === 'left' && (
              <div className="flex items-center gap-2 text-yellow-600">
                <Pause className="w-6 h-6" />
                <span className="font-medium">Release to {recordingState === 'paused' ? 'Resume' : 'Pause'}</span>
              </div>
            )}
            {swipeDirection === 'up' && (
              <div className="flex items-center gap-2 text-purple-500">
                <Lock className="w-6 h-6" />
                <span className="font-medium">Release for Hands-free</span>
              </div>
            )}
            {swipeDirection === 'down' && (
              <div className="flex items-center gap-2 text-green-500">
                <Send className="w-6 h-6" />
                <span className="font-medium">Release to Send</span>
              </div>
            )}
          </div>
        )}

        {/* Recording indicator */}
        <div className={`flex items-center gap-3 flex-1 ${swipeDirection !== 'none' ? 'opacity-30' : ''}`}>
          <div className={`w-3 h-3 rounded-full ${
            recordingState === 'paused' ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
          }`} />
          <span className="font-mono text-lg font-medium text-gray-700">
            {formatDuration(duration)}
          </span>
          {isHandsFree && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
              <Lock className="w-3 h-3" />
              <span>Hands-free</span>
            </div>
          )}
          <div className="flex-1 h-8 bg-gray-200 rounded-lg overflow-hidden">
            <div
              className={`h-full ${recordingState === 'paused' ? 'bg-yellow-400' : 'bg-gradient-to-r from-red-400 to-red-500 animate-pulse'}`}
              style={{ width: `${Math.min((duration / maxDuration) * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">
            {formatDuration(maxDuration - duration)}
          </span>
        </div>

        {/* Action buttons */}
        <div className={`flex items-center gap-2 ${swipeDirection !== 'none' ? 'opacity-30' : ''}`}>
          {recordingState === 'paused' ? (
            <button
              onClick={resumeRecording}
              className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
            >
              <Mic className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={pauseRecording}
              className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
            >
              <Pause className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={stopRecording}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={cancelRecording}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Preview state
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <button
        onClick={togglePlayback}
        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg flex items-center px-3">
          <div className="flex gap-0.5 items-center h-full w-full">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-400 rounded-full"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
        </div>
        <span className="font-mono text-sm text-gray-600 min-w-[40px]">
          {formatDuration(duration)}
        </span>
      </div>
      <button
        onClick={handleSend}
        className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
      >
        <Send className="w-5 h-5" />
      </button>
      <button
        onClick={cancelRecording}
        className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
