'use client';

import { useSearchParams } from 'next/navigation';
import { ConversationList } from '@/components/sidebar/ConversationList';
import { ChatView } from '@/components/chat/ChatView';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { useSearch } from '@/lib/hooks/useSearch';
import { useState, useEffect } from 'react';
import type { Conversation } from '@/types/database';

export default function Home() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chat');
  const chatIdNum = chatId ? parseInt(chatId, 10) : null;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isIndexBuilt, setIsIndexBuilt] = useState<boolean | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Search state
  const search = useSearch();

  // Check if search index is built
  useEffect(() => {
    fetch('/api/init-search')
      .then((res) => res.json())
      .then((data) => {
        setIsIndexBuilt(data.isBuilt);
      })
      .catch((error) => {
        console.error('Error checking search index:', error);
      });
  }, []);

  // Fetch conversation details when chatId changes
  useEffect(() => {
    if (!chatIdNum) {
      setConversation(null);
      return;
    }

    fetch(`/api/conversations?limit=1&offset=0`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations) {
          // Find the conversation with matching ID
          const conv = data.conversations.find((c: Conversation) => c.id === chatIdNum);
          setConversation(conv || null);

          // If not found in first page, try fetching more (simplified for now)
          if (!conv) {
            // In a real app, we'd fetch the specific conversation
            // For now, just set to null
            setConversation(null);
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching conversation:', error);
      });
  }, [chatIdNum]);

  // Build search index
  const buildSearchIndex = async () => {
    setIsBuilding(true);
    try {
      const res = await fetch('/api/init-search', { method: 'POST' });
      const data = await res.json();

      if (data.status === 'completed') {
        setIsIndexBuilt(true);
        alert(`Search index built successfully! Indexed ${data.messagesIndexed} messages in ${(data.duration / 1000).toFixed(1)}s`);
      }
    } catch (error) {
      console.error('Error building search index:', error);
      alert('Failed to build search index. Check console for details.');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
      {/* Global search bar with filter toggle */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl px-4 flex items-center gap-2">
        <SearchBar
          value={search.query}
          onChange={search.setQuery}
          onFocus={() => setIsSearchOpen(true)}
          isLoading={search.isLoading}
        />
        <button
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className="p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Toggle filters"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>
      </div>

      {/* Search results overlay */}
      <SearchResults
        results={search.results}
        isLoading={search.isLoading}
        error={search.error}
        query={search.query}
        total={search.total}
        hasMore={search.hasMore}
        onLoadMore={search.loadMore}
        onClose={() => {
          setIsSearchOpen(false);
          search.clear();
        }}
        isOpen={isSearchOpen && (search.query.length > 0 || search.results.length > 0)}
      />

      {/* Search index banner */}
      {isIndexBuilt === false && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3 z-50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Search index not built
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Build the search index to enable full-text search across all messages.
                </p>
              </div>
            </div>
            <button
              onClick={buildSearchIndex}
              disabled={isBuilding}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isBuilding ? 'Building...' : 'Build Now'}
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className={`flex w-full ${isIndexBuilt === false ? 'mt-20' : ''}`}>
        {/* Sidebar */}
        <ConversationList />

        {/* Chat view */}
        {chatIdNum ? (
          <ChatView chatId={chatIdNum} conversation={conversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-black">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-lg font-medium">Select a conversation to start</p>
              <p className="text-sm mt-2">Choose from the conversations on the left</p>
            </div>
          </div>
        )}

        {/* Filter panel */}
        <FilterPanel
          filters={search.filters}
          onFiltersChange={search.setFilters}
          isOpen={isFilterPanelOpen}
          onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
        />
      </div>
    </div>
  );
}
