"use client";

import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

interface Emoji {
  emoji: string;
  name: string;
  keywords: string[];
  category: string;
}

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4002';

const CATEGORY_ICONS: Record<string, string> = {
  shopping: '🛒',
  emotions: '😊',
  delivery: '🚚',
  business: '💼',
  greetings: '👋',
  money: '💰',
};

export default function EmojiPicker({ isOpen, onClose, onSelect }: EmojiPickerProps) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchEmojis();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = emojis.filter(
        e =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredEmojis(filtered);
    } else if (activeCategory) {
      setFilteredEmojis(emojis.filter(e => e.category === activeCategory));
    } else {
      setFilteredEmojis(emojis);
    }
  }, [searchQuery, activeCategory, emojis]);

  const fetchEmojis = async () => {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/api/chat/emojis`);
      const data = await response.json();
      setEmojis(data.emojis || []);
      setCategories(data.categories || []);
      if (data.categories?.length > 0) {
        setActiveCategory(data.categories[0]);
      }
    } catch (error) {
      console.error('Failed to fetch emojis:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Emojis</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emojis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeCategory === category
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{CATEGORY_ICONS[category] || '📦'}</span>
              <span className="capitalize">{category}</span>
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="p-2 max-h-60 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={`${emoji.name}-${index}`}
              onClick={() => {
                onSelect(emoji.emoji);
                onClose();
              }}
              className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded-lg transition"
              title={emoji.name}
            >
              {emoji.emoji}
            </button>
          ))}
        </div>

        {filteredEmojis.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No emojis found
          </div>
        )}
      </div>
    </div>
  );
}
