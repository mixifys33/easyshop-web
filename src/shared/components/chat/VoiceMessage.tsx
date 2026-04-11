"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoiceMessageProps {
  url: string;
  duration: number;
  isOwn: boolean;
}

export default function VoiceMessage({ url, duration, isOwn }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleLoaded = () => {
      setIsLoaded(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoaded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadeddata', handleLoaded);
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !isLoaded) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-2xl min-w-[200px] max-w-[280px] ${
        isOwn
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-800'
      }`}
    >
      <audio ref={audioRef} src={url} preload="metadata" className="hidden" />

      <button
        onClick={togglePlayback}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition ${
          isOwn
            ? 'bg-white/20 hover:bg-white/30'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        {/* Waveform / Progress bar */}
        <div
          className={`h-8 rounded-lg cursor-pointer flex items-center gap-0.5 px-1 ${
            isOwn ? 'bg-white/20' : 'bg-gray-200'
          }`}
          onClick={handleSeek}
        >
          {Array.from({ length: 25 }).map((_, i) => {
            const barProgress = (i / 25) * 100;
            const isActive = barProgress <= progress;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-colors ${
                  isOwn
                    ? isActive
                      ? 'bg-white'
                      : 'bg-white/40'
                    : isActive
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                }`}
                style={{ height: `${Math.random() * 60 + 30}%` }}
              />
            );
          })}
        </div>

        {/* Time */}
        <div className="flex justify-between text-xs opacity-80">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
