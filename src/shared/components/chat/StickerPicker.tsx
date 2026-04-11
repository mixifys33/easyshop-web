"use client";

import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import Image from 'next/image';

interface Sticker {
  id: string;
  name: string;
  url: string;
  category: string;
  keywords: string[];
}

interface StickerCategory {
  id: string;
  name: string;
  count: number;
}

interface StickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sticker: { id: string; url: string; name: string }) => void;
}

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4002';

const CATEGORY_ICONS: Record<string, string> = {
  shopping: '🛒',
  greeting: '👋',
  emotion: '😊',
  celebration: '🎉',
  business: '💼',
  delivery: '🚚',
};

export default function StickerPicker({ isOpen, onClose, onSelect }: StickerPickerProps) {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [categories, setCategories] = useState<StickerCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStickers, setFilteredStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchStickers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = stickers.filter(
        s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredStickers(filtered);
    } else if (activeCategory) {
      setFilteredStickers(stickers.filter(s => s.category === activeCategory));
    } else {
      setFilteredStickers(stickers);
    }
  }, [searchQuery, activeCategory, stickers]);

  const fetchStickers = async () => {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/api/chat/stickers`);
      const data = await response.json();
      setStickers(data.stickers || []);
      setCategories(data.categories || []);
      if (data.categories?.length > 0) {
        setActiveCategory(data.categories[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch stickers:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Stickers</h3>
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
            placeholder="Search stickers..."
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
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeCategory === category.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{CATEGORY_ICONS[category.id] || '📦'}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Sticker Grid */}
      <div className="p-2 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-4 gap-2">
          {filteredStickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => {
                onSelect({
                  id: sticker.id,
                  url: sticker.url,
                  name: sticker.name,
                });
                onClose();
              }}
              className="aspect-square flex items-center justify-center p-2 hover:bg-gray-100 rounded-xl transition border border-gray-100"
              title={sticker.name}
            >
              <div className="relative w-full h-full">
                {/* Placeholder for sticker - will show actual image when URLs are set */}
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-2xl">
                  {CATEGORY_ICONS[sticker.category] || '🎨'}
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredStickers.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No stickers found
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 bg-gray-50 text-center">
        <p className="text-xs text-gray-500">
          60 e-commerce stickers available
        </p>
      </div>
    </div>
  );
}
