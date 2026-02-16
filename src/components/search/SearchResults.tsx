'use client';

import { useEffect, useRef } from 'react';
import { SearchResultItem } from './SearchResultItem';
import type { SearchResult } from '@/types/database';
import { Virtuoso } from 'react-virtuoso';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div
        ref={overlayRef}
        className="w-full max-w-2xl mx-4 rounded-xl shadow-2xl flex flex-col animate-scale-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          maxHeight: '70vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Search Results
            </h2>
            {total > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                {total}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results - FIX: use flex-1 with min-h-0 for proper flex layout instead of fixed 500px */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center p-8">
              <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>Search Error</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{error}</p>
            </div>
          ) : isLoading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Searching...</p>
            </div>
          ) : results.length === 0 && query ? (
            <div className="flex flex-col items-center justify-center p-8">
              <svg className="w-10 h-10 mb-3" style={{ color: 'var(--muted-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>No results found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Try a different search term</p>
            </div>
          ) : results.length > 0 ? (
            <Virtuoso
              data={results}
              endReached={hasMore ? onLoadMore : undefined}
              itemContent={(_, result) => (
                <SearchResultItem key={result.message.id} result={result} onClose={onClose} />
              )}
              style={{ height: '100%' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Start typing to search</p>
            </div>
          )}
        </div>

        {/* Loading more */}
        {isLoading && results.length > 0 && (
          <div
            className="px-4 py-2 flex items-center justify-center flex-shrink-0"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin mr-2"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
}
