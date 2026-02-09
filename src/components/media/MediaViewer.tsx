'use client';

import { useEffect, useCallback } from 'react';
import type { Attachment } from '@/types/database';
import { isVideoFile } from '@/lib/utils/attachment-path';
import { formatMessageTimestamp } from '@/lib/utils/date-conversion';
import { formatContactIdentifier } from '@/lib/utils/format';
import Image from 'next/image';

interface MediaViewerProps {
  media: Attachment[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function MediaViewer({ media, currentIndex, onClose, onNavigate }: MediaViewerProps) {
  const currentMedia = media[currentIndex];
  const isVideo = isVideoFile(currentMedia.mimeType, currentMedia.filename);
  const attachmentUrl = `/api/attachments/${currentMedia.id}`;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate('prev');
      } else if (e.key === 'ArrowRight' && currentIndex < media.length - 1) {
        onNavigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, media.length, onClose, onNavigate]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-white"
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

          {/* Media info */}
          <div className="text-white">
            <div className="text-sm font-medium">
              {currentIndex + 1} of {media.length}
            </div>
            {currentMedia.messageDate && (
              <div className="text-xs text-gray-400">
                {formatMessageTimestamp(currentMedia.messageDate)}
              </div>
            )}
          </div>
        </div>

        {/* Download button */}
        <a
          href={attachmentUrl}
          download
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </a>
      </div>

      {/* Media content */}
      <div className="flex-1 flex items-center justify-center relative">
        {isVideo ? (
          <video
            src={attachmentUrl}
            controls
            className="max-w-full max-h-full"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="relative max-w-full max-h-full">
            <Image
              src={attachmentUrl}
              alt="Media"
              width={1200}
              height={800}
              className="max-w-full max-h-[calc(100vh-200px)] object-contain"
              unoptimized
            />
          </div>
        )}

        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {currentIndex < media.length - 1 && (
          <button
            onClick={() => onNavigate('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Footer with keyboard hints */}
      <div className="px-4 py-2 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          <span>
            <kbd className="px-2 py-1 bg-gray-700 rounded">←</kbd> Previous
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-700 rounded">→</kbd> Next
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-700 rounded">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}
