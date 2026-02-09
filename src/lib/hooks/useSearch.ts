import { useState, useEffect, useCallback } from 'react';
import type { SearchResult, SearchFilters } from '@/types/database';

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  hasMore: boolean;
  total: number;
  loadMore: () => void;
  clear: () => void;
}

export function useSearch(): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotal(0);
      setHasMore(false);
      setOffset(0);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query, filters, 0);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const performSearch = async (
    searchQuery: string,
    searchFilters: SearchFilters,
    searchOffset: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '20',
        offset: searchOffset.toString(),
      });

      // Add filters
      if (searchFilters.dateFrom) {
        params.set('dateFrom', searchFilters.dateFrom.toISOString());
      }
      if (searchFilters.dateTo) {
        params.set('dateTo', searchFilters.dateTo.toISOString());
      }
      if (searchFilters.personIds && searchFilters.personIds.length > 0) {
        params.set('personId', searchFilters.personIds[0].toString());
      }
      if (searchFilters.direction && searchFilters.direction !== 'all') {
        params.set('direction', searchFilters.direction);
      }
      if (searchFilters.hasAttachment !== undefined) {
        params.set('hasAttachment', searchFilters.hasAttachment.toString());
      }
      if (searchFilters.chatType && searchFilters.chatType !== 'all') {
        params.set('chatType', searchFilters.chatType);
      }

      const response = await fetch(`/api/search?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Search failed');
      }

      const data = await response.json();

      // Parse dates in results
      const parsedResults = data.results.map((result: any) => ({
        ...result,
        message: {
          ...result.message,
          date: new Date(result.message.date),
        },
        conversation: {
          ...result.conversation,
          lastMessageDate: result.conversation.lastMessageDate
            ? new Date(result.conversation.lastMessageDate)
            : null,
        },
        contextBefore: result.contextBefore?.map((msg: any) => ({
          ...msg,
          date: new Date(msg.date),
        })),
        contextAfter: result.contextAfter?.map((msg: any) => ({
          ...msg,
          date: new Date(msg.date),
        })),
      }));

      if (searchOffset === 0) {
        setResults(parsedResults);
      } else {
        setResults((prev) => [...prev, ...parsedResults]);
      }

      setHasMore(data.hasMore);
      setTotal(data.total);
      setOffset(searchOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || !query.trim()) return;
    performSearch(query, filters, offset + 20);
  }, [query, filters, offset, hasMore, isLoading]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setFilters({});
    setError(null);
    setTotal(0);
    setHasMore(false);
    setOffset(0);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    filters,
    setFilters,
    hasMore,
    total,
    loadMore,
    clear,
  };
}
