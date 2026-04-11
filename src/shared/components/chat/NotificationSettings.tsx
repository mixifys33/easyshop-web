"use client";

import React from 'react';
import { Bell, Volume2, VolumeX, BellOff } from 'lucide-react';
import type { NotificationSettings as NotificationSettingsType } from '@/types/chat';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onUpdate: (settings: Partial<NotificationSettingsType>) => void;
}

export default function NotificationSettings({
  settings,
  onUpdate,
}: NotificationSettingsProps) {
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onUpdate({ browserNotificationsEnabled: true });
      }
    }
  };

  const notificationPermission = typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'denied';

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Notification Settings
      </h3>

      <div className="space-y-4">
        {/* Sound notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-blue-500" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-700">Sound notifications</p>
              <p className="text-sm text-gray-500">Play sound for new messages</p>
            </div>
          </div>
          <button
            onClick={() => onUpdate({ soundEnabled: !settings.soundEnabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={settings.soundEnabled}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Browser notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.browserNotificationsEnabled ? (
              <Bell className="w-5 h-5 text-blue-500" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-700">Browser notifications</p>
              <p className="text-sm text-gray-500">
                Show desktop notifications
                {notificationPermission === 'denied' && (
                  <span className="text-red-500 ml-1">(Blocked in browser)</span>
                )}
              </p>
            </div>
          </div>
          {notificationPermission === 'granted' ? (
            <button
              onClick={() => onUpdate({ browserNotificationsEnabled: !settings.browserNotificationsEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.browserNotificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={settings.browserNotificationsEnabled}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings.browserNotificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          ) : notificationPermission === 'denied' ? (
            <span className="text-xs text-gray-400">Enable in browser settings</span>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Enable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
