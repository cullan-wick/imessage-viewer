'use client';

import { useEffect, useRef } from 'react';
import { SearchResultItem } from './SearchResultItem';
import type { SearchResult } from '@/types/database';
import { Virtuoso } from 'react-virtuoso';
import clsx from 'clsx';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  query: string;
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function SearchResults({
  results,
  isLoading,
  error,
  query,
  total,
  hasMore,
  onLoadMore,
  onClose,
  isOpen,
}: SearchResultsProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div
        ref={overlayRef}
        className="w-full max-w-3xl mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-h-[70vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Results
            </h2>
            {total > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {total} {total === 1 ? 'result' : 'results'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <svg
                className="w-12 h-12 text-red-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-600 dark:text-red-400 font-medium mb-2">Search Error</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          ) : isLoading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Searching...</p>
            </div>
          ) : results.length === 0 && query ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
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
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                No results found
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Try a different search term or adjust your filters
              </p>
            </div>
          ) : results.length > 0 ? (
            <Virtuoso
              data={results}
              endReached={hasMore ? onLoadMore : undefined}
              itemContent={(index, result) => (
                <SearchResultItem key={result.message.id} result={result} onClose={onClose} />
              )}
              style={{ height: '100%' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
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
              <p className="text-gray-600 dark:text-gray-400">
                Start typing to search your messages
              </p>
            </div>
          )}
        </div>

        {/* Footer with loading more indicator */}
        {isLoading && results.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
}
