"use client";

import React from 'react';
import { Search, MessageSquarePlus, Loader2, Store, ShoppingBag, Package } from 'lucide-react';
import type { Conversation, UserStatus } from '@/types/chat';
import ConversationItem from './ConversationItem';

interface Seller {
  id: string;
  name: string;
  shopName?: string;
  avatar?: string;
  productCount?: number;
  lastProductTitle?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  loading: boolean;
  currentUserId: string;
  userStatuses: Map<string, UserStatus>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewConversation?: () => void;
  onSelectSeller?: (seller: Seller) => void;
  emptyMessage?: string;
  showSellersSection?: boolean;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
  currentUserId,
  userStatuses,
  searchQuery,
  onSearchChange,
  onNewConversation,
  onSelectSeller,
  emptyMessage = 'No conversations yet',
  showSellersSection = true,
}: ConversationListProps) {
  const [activeTab, setActiveTab] = React.useState<'messages' | 'sellers'>('messages');
  
  // Extract unique sellers from conversations with more details
  const sellers = React.useMemo(() => {
    const sellerMap = new Map<string, Seller>();
    
    conversations.forEach(conv => {
      const seller = conv.participants.find(p => p.odiv_type === 'seller');
      if (seller && !sellerMap.has(seller.odiv)) {
        sellerMap.set(seller.odiv, {
          id: seller.odiv,
          name: seller.name,
          shopName: seller.shopName,
          avatar: seller.avatar,
          productCount: 1,
          lastProductTitle: conv.productTitle,
        });
      } else if (seller) {
        const existing = sellerMap.get(seller.odiv)!;
        existing.productCount = (existing.productCount || 0) + 1;
        // Keep the most recent product title
        if (conv.productTitle && !existing.lastProductTitle) {
          existing.lastProductTitle = conv.productTitle;
        }
      }
    });
    
    return Array.from(sellerMap.values());
  }, [conversations]);

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const otherParticipant = conv.participants.find(p => p.odiv !== currentUserId);
    return (
      otherParticipant?.name.toLowerCase().includes(query) ||
      otherParticipant?.shopName?.toLowerCase().includes(query) ||
      conv.productTitle?.toLowerCase().includes(query) ||
      conv.lastMessage?.content.toLowerCase().includes(query)
    );
  });

  // Filter sellers by search query
  const filteredSellers = sellers.filter(seller => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      seller.name.toLowerCase().includes(query) ||
      seller.shopName?.toLowerCase().includes(query)
    );
  });

  // Sort by most recent
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aTime = new Date(a.lastMessage?.timestamp || a.updatedAt).getTime();
    const bTime = new Date(b.lastMessage?.timestamp || b.updatedAt).getTime();
    return bTime - aTime;
  });

  const handleSelectSeller = (seller: Seller) => {
    // Find existing conversation with this seller
    const existingConv = conversations.find(conv =>
      conv.participants.some(p => p.odiv === seller.id && p.odiv_type === 'seller')
    );
    
    if (existingConv) {
      onSelect(existingConv);
    } else if (onSelectSeller) {
      onSelectSeller(seller);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition"
              aria-label="New conversation"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search conversations"
          />
        </div>

        {/* Tabs - Messages / Sellers */}
        {showSellersSection && sellers.length > 0 && (
          <div className="flex mt-3 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition ${
                activeTab === 'messages'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              Messages
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition ${
                activeTab === 'sellers'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Store className="w-4 h-4" />
              Sellers ({sellers.length})
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2" role="list" aria-label="Conversations">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : activeTab === 'messages' ? (
          // Messages Tab
          sortedConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquarePlus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {searchQuery ? 'No conversations found' : emptyMessage}
              </p>
              {!searchQuery && onNewConversation && (
                <button
                  onClick={onNewConversation}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                >
                  Start a conversation
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {sortedConversations.map(conversation => {
                const otherParticipant = conversation.participants.find(p => p.odiv !== currentUserId);
                const status = otherParticipant ? userStatuses.get(otherParticipant.odiv) : undefined;
                
                return (
                  <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    currentUserId={currentUserId}
                    isSelected={selectedId === conversation._id}
                    onClick={() => onSelect(conversation)}
                    participantStatus={status}
                  />
                );
              })}
            </div>
          )
        ) : (
          // Sellers Tab
          filteredSellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                {searchQuery ? 'No sellers found' : 'No sellers yet'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Chat with sellers from product pages
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSellers.map(seller => {
                const status = userStatuses.get(seller.id);
                const isOnline = status?.status === 'online' || status?.status === 'online_in_chat';
                
                return (
                  <button
                    key={seller.id}
                    onClick={() => handleSelectSeller(seller)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left group"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {seller.avatar ? (
                          <img src={seller.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          seller.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">{seller.shopName || seller.name}</span>
                        <Store className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Package className="w-3 h-3" />
                        <span className="truncate">
                          {seller.productCount} conversation{seller.productCount !== 1 ? 's' : ''}
                          {seller.lastProductTitle && ` • ${seller.lastProductTitle}`}
                        </span>
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </div>
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
