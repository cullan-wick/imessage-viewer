'use client';

import { useRouter } from 'next/navigation';
import type { SearchResult } from '@/types/database';
import { formatMessageTimestamp } from '@/lib/utils/date-conversion';
import { formatContactIdentifier } from '@/lib/utils/format';

interface SearchResultItemProps {
  result: SearchResult;
  onClose?: () => void;
}

export function SearchResultItem({ result, onClose }: SearchResultItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/?chat=${result.conversation.id}&message=${result.message.id}`);
    onClose?.();
  };

  const senderName =
    result.message.senderName ||
    (result.message.senderId ? formatContactIdentifier(result.message.senderId) : 'Unknown');

  return (
    <div
      onClick={handleClick}
      className="px-4 py-3 cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid var(--border-light)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
            {result.conversation.displayName}
          </span>
          {result.conversation.isGroup && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--surface-hover)', color: 'var(--muted)' }}
            >
              Group
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {formatMessageTimestamp(result.message.date)}
        </span>
      </div>

      {/* Sender */}
      {!result.message.isFromMe && (
        <div className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
          {senderName}
        </div>
      )}

      {/* Context before */}
      {result.contextBefore && result.contextBefore.length > 0 && (
        <div className="mb-1">
          {result.contextBefore.map((msg) => (
            <div key={msg.id} className="text-xs truncate" style={{ color: 'var(--muted-light)' }}>
              {msg.isFromMe ? 'You: ' : ''}{msg.text || '(attachment)'}
            </div>
          ))}
        </div>
      )}

      {/* Matched message */}
      <div
        className="text-sm font-medium"
        style={{ color: result.message.isFromMe ? 'var(--accent)' : 'var(--foreground)' }}
        dangerouslySetInnerHTML={{ __html: result.snippet }}
      />

      {/* Context after */}
      {result.contextAfter && result.contextAfter.length > 0 && (
        <div className="mt-1">
          {result.contextAfter.map((msg) => (
            <div key={msg.id} className="text-xs truncate" style={{ color: 'var(--muted-light)' }}>
              {msg.isFromMe ? 'You: ' : ''}{msg.text || '(attachment)'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
