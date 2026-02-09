'use client';

import { useInView } from 'react-intersection-observer';
import { MediaItem } from './MediaItem';
import type { Attachment } from '@/types/database';

interface MediaGridProps {
  media: Attachment[];
  onMediaClick: (index: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function MediaGrid({ media, onMediaClick, onLoadMore, hasMore }: MediaGridProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  // Trigger load more when sentinel is in view
  if (inView && hasMore && onLoadMore) {
    onLoadMore();
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
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
        <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No media found</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          This conversation has no images or videos
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {media.map((item, index) => (
          <MediaItem
            key={item.id}
            attachment={item}
            onClick={() => onMediaClick(index)}
          />
        ))}
      </div>

      {/* Load more sentinel */}
      {hasMore && (
        <div ref={ref} className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}
    </div>
  );
}
