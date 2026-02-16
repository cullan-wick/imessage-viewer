'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '@/types/database';
import { ConversationItem } from './ConversationItem';
import { Virtuoso } from 'react-virtuoso';

interface ConversationListProps {
  onConversationSelect?: (conversation: Conversation) => void;
}

export function ConversationList({ onConversationSelect }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setConversations([]);
    fetchConversations(0, searchTerm);
  }, [searchTerm]);

  const fetchConversations = async (offset: number, search: string) => {
    try {
      const url = new URL('/api/conversations', window.location.origin);
      url.searchParams.set('limit', '50');
      url.searchParams.set('offset', offset.toString());
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();

      const parsed = (data.conversations || []).map((conv: any) => ({
        ...conv,
        lastMessageDate: conv.lastMessageDate ? new Date(conv.lastMessageDate) : null,
      }));

      if (offset === 0) {
        setConversations(parsed);
      } else {
        setConversations((prev) => [...prev, ...parsed]);
      }
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    fetchConversations(conversations.length, searchTerm);
  }, [conversations.length, hasMore, isLoading, searchTerm]);

  return (
    <div
      className="flex-shrink-0 flex flex-col h-screen"
      style={{
        width: 'var(--sidebar-width)',
        borderRight: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <h1
          className="text-2xl font-bold tracking-tight mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Messages
        </h1>

        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--muted-light)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus-ring transition-colors"
            style={{
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-hidden">
        {isLoading && conversations.length === 0 ? (
          <div className="px-3 py-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="w-11 h-11 rounded-full animate-shimmer flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3.5 animate-shimmer rounded w-28" />
                  <div className="h-3 animate-shimmer rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex justify-center items-center h-full px-4">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {searchTerm ? 'No conversations match your search' : 'No conversations found'}
            </p>
          </div>
        ) : (
          <Virtuoso
            data={conversations}
            endReached={loadMore}
            itemContent={(_, conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onSelect={onConversationSelect}
              />
            )}
            style={{ height: '100%' }}
          />
        )}
      </div>
    </div>
  );
}
