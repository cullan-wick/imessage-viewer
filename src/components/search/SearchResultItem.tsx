'use client';

import { useRouter } from 'next/navigation';
import type { SearchResult } from '@/types/database';
import { formatMessageTimestamp } from '@/lib/utils/date-conversion';
import { formatContactIdentifier } from '@/lib/utils/format';
import clsx from 'clsx';

interface SearchResultItemProps {
  result: SearchResult;
  onClose?: () => void;
}

export function SearchResultItem({ result, onClose }: SearchResultItemProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to the chat and highlight the message
    router.push(`/?chat=${result.conversation.id}&message=${result.message.id}`);
    onClose?.();
  };

  const senderName =
    result.message.senderName ||
    (result.message.senderId ? formatContactIdentifier(result.message.senderId) : 'Unknown');

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors',
        'border-b border-gray-200 dark:border-gray-700'
      )}
    >
      {/* Header: conversation name and date */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {result.conversation.displayName}
          </span>
          {result.conversation.isGroup && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              Group
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatMessageTimestamp(result.message.date)}
        </span>
      </div>

      {/* Sender (if not from me) */}
      {!result.message.isFromMe && (
        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          {senderName}
        </div>
      )}

      {/* Context before */}
      {result.contextBefore && result.contextBefore.length > 0 && (
        <div className="mb-1">
          {result.contextBefore.map((msg) => (
            <div key={msg.id} className="text-sm text-gray-400 dark:text-gray-500 truncate">
              {msg.isFromMe ? 'You: ' : ''}
              {msg.text || '(attachment)'}
            </div>
          ))}
        </div>
      )}

      {/* Matched message with highlighted snippet */}
      <div
        className={clsx('text-sm mb-1', {
          'text-blue-600 dark:text-blue-400': result.message.isFromMe,
          'text-gray-900 dark:text-white': !result.message.isFromMe,
        })}
      >
        <div
          className="font-medium"
          dangerouslySetInnerHTML={{ __html: result.snippet }}
        />
      </div>

      {/* Context after */}
      {result.contextAfter && result.contextAfter.length > 0 && (
        <div className="mt-1">
          {result.contextAfter.map((msg) => (
            <div key={msg.id} className="text-sm text-gray-400 dark:text-gray-500 truncate">
              {msg.isFromMe ? 'You: ' : ''}
              {msg.text || '(attachment)'}
            </div>
          ))}
        </div>
      )}

      {/* Match count indicator */}
      {result.matchCount > 1 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {result.matchCount} matches in this message
        </div>
      )}
    </div>
  );
}
