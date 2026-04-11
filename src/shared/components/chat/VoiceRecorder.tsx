"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X, Play, Pause } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please grant permission and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);
    onCancel();
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setDuration(0);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
      {!isRecording && !audioBlob && (
        <>
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
          >
            <Mic className="w-5 h-5" />
            <span className="font-medium">Start Recording</span>
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      )}

      {isRecording && (
        <>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-mono text-lg font-medium text-gray-700">
              {formatDuration(duration)}
            </span>
            <div className="flex-1 h-8 bg-gray-200 rounded-lg overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-400 to-red-500 animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
          <button
            onClick={stopRecording}
            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={cancelRecording}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      )}

      {audioBlob && !isRecording && (
        <>
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
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg flex items-center px-3">
              <div className="flex gap-0.5 items-center h-full">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-400 rounded-full"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                ))}
              </div>
            </div>
            <span className="font-mono text-sm text-gray-600">
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
        </>
      )}
    </div>
  );
}
