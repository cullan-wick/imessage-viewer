'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '@/types/database';
import { ConversationItem } from './ConversationItem';
import { ConversationSkeleton } from './ConversationSkeleton';
import { Virtuoso } from 'react-virtuoso';

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch initial conversations
  useEffect(() => {
    fetchConversations(0, searchTerm);
  }, [searchTerm]);

  const fetchConversations = async (offset: number, search: string) => {
    try {
      const url = new URL('/api/conversations', window.location.origin);
      url.searchParams.set('limit', '50');
      url.searchParams.set('offset', offset.toString());
      if (search) {
        url.searchParams.set('search', search);
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      // Parse date strings back to Date objects
      const conversations = (data.conversations || []).map((conv: any) => ({
        ...conv,
        lastMessageDate: conv.lastMessageDate ? new Date(conv.lastMessageDate) : null,
      }));

      if (offset === 0) {
        setConversations(conversations);
      } else {
        setConversations((prev) => [...prev, ...conversations]);
      }

      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more conversations
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    fetchConversations(conversations.length, searchTerm);
  }, [conversations.length, hasMore, isLoading, searchTerm]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsLoading(true);
  };

  return (
    <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Messages</h1>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-hidden">
        {isLoading && conversations.length === 0 ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
            <p>No conversations found</p>
          </div>
        ) : (
          <Virtuoso
            data={conversations}
            endReached={loadMore}
            itemContent={(index, conversation) => (
              <ConversationItem key={conversation.id} conversation={conversation} />
            )}
            style={{ height: '100%' }}
          />
        )}
      </div>
    </div>
  );
}
