'use client';

import { useState, useEffect } from 'react';
import { MediaGrid } from './MediaGrid';
import { MediaViewer } from './MediaViewer';
import type { Attachment } from '@/types/database';

interface MediaGalleryProps {
  chatId: number;
  isOpen: boolean;
  onClose: () => void;
}

type MediaType = 'all' | 'image' | 'video';

export function MediaGallery({ chatId, isOpen, onClose }: MediaGalleryProps) {
  const [media, setMedia] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [hasMore, setHasMore] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setMedia([]);

    fetch(`/api/media/${chatId}?type=${mediaType}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        setMedia(data.media.map((item: any) => ({
          ...item,
          messageDate: item.messageDate ? new Date(item.messageDate) : null,
        })));
        setHasMore(data.hasMore);
      })
      .catch((error) => console.error('Error fetching media:', error))
      .finally(() => setIsLoading(false));
  }, [isOpen, chatId, mediaType]);

  const loadMore = () => {
    if (!hasMore || isLoading) return;
    fetch(`/api/media/${chatId}?type=${mediaType}&limit=100&offset=${media.length}`)
      .then((res) => res.json())
      .then((data) => {
        setMedia((prev) => [...prev, ...data.media.map((item: any) => ({
          ...item,
          messageDate: item.messageDate ? new Date(item.messageDate) : null,
        }))]);
        setHasMore(data.hasMore);
      })
      .catch((error) => console.error('Error loading more media:', error));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewerIndex === null) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, viewerIndex]);

  if (!isOpen) return null;

  const tabs: { key: MediaType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'image', label: 'Photos' },
    { key: 'video', label: 'Videos' },
  ];

  return (
    <div className="fixed inset-0 z-50" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--muted)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Media Gallery</h2>
          {media.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{media.length} items</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--background)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMediaType(tab.key)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              style={{
                background: mediaType === tab.key ? 'var(--surface)' : 'transparent',
                color: mediaType === tab.key ? 'var(--foreground)' : 'var(--muted)',
                boxShadow: mediaType === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-57px)] overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <MediaGrid media={media} onMediaClick={(i) => setViewerIndex(i)} onLoadMore={loadMore} hasMore={hasMore} />
        )}
      </div>

      {viewerIndex !== null && (
        <MediaViewer
          media={media}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={(dir) => {
            if (dir === 'prev' && viewerIndex > 0) setViewerIndex(viewerIndex - 1);
            else if (dir === 'next' && viewerIndex < media.length - 1) setViewerIndex(viewerIndex + 1);
          }}
        />
      )}
    </div>
  );
}
