'use client';

import { useState } from 'react';
import type { Attachment } from '@/types/database';
import { isVideoFile } from '@/lib/utils/attachment-path';
import Image from 'next/image';
import clsx from 'clsx';

interface MediaItemProps {
  attachment: Attachment;
  onClick: () => void;
}

export function MediaItem({ attachment, onClick }: MediaItemProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isVideo = isVideoFile(attachment.mimeType, attachment.filename);
  const attachmentUrl = `/api/attachments/${attachment.id}`;

  if (imageError) {
    return (
      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer',
        'hover:opacity-90 transition-opacity',
        {
          'animate-pulse': isLoading,
        }
      )}
    >
      {/* Thumbnail */}
      <Image
        src={attachmentUrl}
        alt="Media"
        fill
        className="object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        unoptimized
      />

      {/* Video indicator */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-900 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
