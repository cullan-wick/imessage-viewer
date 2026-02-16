'use client';

import type { Attachment } from '@/types/database';
import { isImageFile, isVideoFile, isAudioFile, formatFileSize } from '@/lib/utils/attachment-path';
import Image from 'next/image';
import { useState } from 'react';

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

  if (isImage && !imageError) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${isLoading ? 'animate-shimmer' : ''}`}
        onClick={onClick}
        style={{ maxWidth: 280, background: 'var(--surface-hover)' }}
      >
        <Image
          src={attachmentUrl}
          alt="Attachment"
          width={280}
          height={200}
          className="object-contain w-full h-auto rounded-xl"
          onLoad={() => setIsLoading(false)}
          onError={() => { setImageError(true); setIsLoading(false); }}
          unoptimized
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-black" style={{ maxWidth: 280, maxHeight: 280 }}>
        <video src={attachmentUrl} controls className="w-full h-full" style={{ maxWidth: 280, maxHeight: 280 }} preload="metadata">
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <audio src={attachmentUrl} controls className="flex-1 max-w-[200px]" />
      </div>
    );
  }

  // File attachment
  return (
    <a
      href={attachmentUrl}
      download
      className="flex items-center gap-2.5 p-2.5 rounded-lg transition-opacity hover:opacity-80"
      style={{ background: 'rgba(255,255,255,0.1)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--muted-light)' }}>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {attachment.transferName || attachment.filename || 'Unknown file'}
        </div>
        {attachment.totalBytes > 0 && (
          <div className="text-xs opacity-70">{formatFileSize(attachment.totalBytes)}</div>
        )}
      </div>
      <svg className="w-4 h-4 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  );
}
