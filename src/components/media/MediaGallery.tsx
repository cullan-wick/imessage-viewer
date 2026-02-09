'use client';

import { useState, useEffect } from 'react';
import { MediaGrid } from './MediaGrid';
import { MediaViewer } from './MediaViewer';
import type { Attachment } from '@/types/database';
import clsx from 'clsx';

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

  // Fetch media when gallery opens or media type changes
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setMedia([]);

    fetch(`/api/media/${chatId}?type=${mediaType}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        // Parse dates
        const parsedMedia = data.media.map((item: any) => ({
          ...item,
          messageDate: item.messageDate ? new Date(item.messageDate) : null,
        }));

        setMedia(parsedMedia);
        setHasMore(data.hasMore);
      })
      .catch((error) => {
        console.error('Error fetching media:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, chatId, mediaType]);

  // Load more media
  const loadMore = () => {
    if (!hasMore || isLoading) return;

    fetch(`/api/media/${chatId}?type=${mediaType}&limit=100&offset=${media.length}`)
      .then((res) => res.json())
      .then((data) => {
        const parsedMedia = data.media.map((item: any) => ({
          ...item,
          messageDate: item.messageDate ? new Date(item.messageDate) : null,
        }));

        setMedia((prev) => [...prev, ...parsedMedia]);
        setHasMore(data.hasMore);
      })
      .catch((error) => {
        console.error('Error loading more media:', error);
      });
  };

  // Keyboard shortcut to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewerIndex === null) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, viewerIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-400"
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

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Media Gallery</h2>

          {media.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {media.length} {media.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Media type tabs */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setMediaType('all')}
            className={clsx(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              {
                'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm': mediaType === 'all',
                'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': mediaType !== 'all',
              }
            )}
          >
            All
          </button>
          <button
            onClick={() => setMediaType('image')}
            className={clsx(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              {
                'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm': mediaType === 'image',
                'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': mediaType !== 'image',
              }
            )}
          >
            Photos
          </button>
          <button
            onClick={() => setMediaType('video')}
            className={clsx(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              {
                'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm': mediaType === 'video',
                'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white': mediaType !== 'video',
              }
            )}
          >
            Videos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-73px)] overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <MediaGrid
            media={media}
            onMediaClick={(index) => setViewerIndex(index)}
            onLoadMore={loadMore}
            hasMore={hasMore}
          />
        )}
      </div>

      {/* Media viewer (lightbox) */}
      {viewerIndex !== null && (
        <MediaViewer
          media={media}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={(direction) => {
            if (direction === 'prev' && viewerIndex > 0) {
              setViewerIndex(viewerIndex - 1);
            } else if (direction === 'next' && viewerIndex < media.length - 1) {
              setViewerIndex(viewerIndex + 1);
            }
          }}
        />
      )}
    </div>
  );
}
