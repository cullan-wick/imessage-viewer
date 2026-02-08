'use client';

import type { Attachment } from '@/types/database';
import { isImageFile, isVideoFile, isAudioFile, formatFileSize } from '@/lib/utils/attachment-path';
import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';

interface AttachmentPreviewProps {
  attachment: Attachment;
  onClick?: () => void;
}

export function AttachmentPreview({ attachment, onClick }: AttachmentPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isImage = isImageFile(attachment.mimeType, attachment.filename);
  const isVideo = isVideoFile(attachment.mimeType, attachment.filename);
  const isAudio = isAudioFile(attachment.mimeType, attachment.filename);

  const attachmentUrl = `/api/attachments/${attachment.id}`;

  // Image attachments
  if (isImage && !imageError) {
    return (
      <div
        className={clsx(
          'relative rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity',
          'bg-gray-200 dark:bg-gray-700',
          {
            'animate-pulse': isLoading,
          }
        )}
        onClick={onClick}
        style={{ maxWidth: '300px' }}
      >
        <Image
          src={attachmentUrl}
          alt="Attachment"
          width={300}
          height={200}
          className="object-contain w-full h-auto rounded-xl"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
          unoptimized // Since we're serving from our API
        />
      </div>
    );
  }

  // Video attachments
  if (isVideo) {
    return (
      <div
        className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-black"
        onClick={onClick}
        style={{ maxWidth: '300px', maxHeight: '300px' }}
      >
        <video
          src={attachmentUrl}
          controls
          className="w-full h-full"
          style={{ maxWidth: '300px', maxHeight: '300px' }}
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Video
        </div>
      </div>
    );
  }

  // Audio attachments
  if (isAudio) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white/10 dark:bg-black/10 rounded-lg">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <audio src={attachmentUrl} controls className="w-full max-w-xs" />
        </div>
      </div>
    );
  }

  // Other file types (documents, etc.)
  return (
    <a
      href={attachmentUrl}
      download
      className="flex items-center gap-3 p-3 bg-white/10 dark:bg-black/10 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex-shrink-0 w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {attachment.transferName || attachment.filename || 'Unknown file'}
        </div>
        {attachment.totalBytes > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(attachment.totalBytes)}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        <svg
          className="w-5 h-5 text-gray-400"
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
      </div>
    </a>
  );
}
