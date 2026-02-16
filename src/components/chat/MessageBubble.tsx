'use client';

import type { Message } from '@/types/database';
import { formatMessageTimestamp } from '@/lib/utils/date-conversion';
import { formatContactIdentifier } from '@/lib/utils/format';
import { AttachmentPreview } from './AttachmentPreview';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  position?: 'first' | 'middle' | 'last' | 'single';
  showTimestamp?: boolean;
  showSender?: boolean;
}

// FIX: Use explicit style objects instead of conflicting clsx conditions
function getBubbleRadius(position: string, isFromMe: boolean): string {
  const r = 18;
  const s = 4; // small radius for grouped corners

  if (position === 'single') {
    return `${r}px`;
  }

  if (isFromMe) {
    // Sent messages: tail on right side
    switch (position) {
      case 'first':
        return `${r}px ${r}px ${s}px ${r}px`;
      case 'middle':
        return `${r}px ${s}px ${s}px ${r}px`;
      case 'last':
        return `${r}px ${s}px ${r}px ${r}px`;
      default:
        return `${r}px`;
    }
  } else {
    // Received messages: tail on left side
    switch (position) {
      case 'first':
        return `${r}px ${r}px ${r}px ${s}px`;
      case 'middle':
        return `${s}px ${r}px ${r}px ${s}px`;
      case 'last':
        return `${s}px ${r}px ${r}px ${r}px`;
      default:
        return `${r}px`;
    }
  }
}

export function MessageBubble({
  message,
  position = 'single',
  showTimestamp = false,
  showSender = false,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isFromMe = message.isFromMe;
  const hasText = message.text && message.text.trim().length > 0;
  const hasAttachments = message.hasAttachments && message.attachments && message.attachments.length > 0;

  if (!hasText && !hasAttachments) return null;

  const isReaction = message.associatedMessageGuid !== null;
  const borderRadius = getBubbleRadius(position, isFromMe);

  return (
    <div
      className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col gap-0.5 max-w-[70%]">
        {/* Sender name */}
        {showSender && !isFromMe && (
          <div className="text-xs font-medium px-2 mb-0.5" style={{ color: 'var(--muted)' }}>
            {message.senderName || (message.senderId ? formatContactIdentifier(message.senderId) : 'Unknown')}
          </div>
        )}

        {/* Bubble */}
        <div
          className="inline-block px-3.5 py-2 max-w-full break-words"
          style={{
            background: isFromMe ? 'var(--bubble-sent)' : 'var(--bubble-recv)',
            color: isFromMe ? 'var(--bubble-sent-text)' : 'var(--bubble-recv-text)',
            borderRadius,
          }}
        >
          {/* Attachments */}
          {hasAttachments && (
            <div className="flex flex-col gap-2 mb-1">
              {message.attachments!.map((attachment) => (
                <AttachmentPreview key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}

          {/* Text */}
          {hasText && (
            <div className="whitespace-pre-wrap text-[15px] leading-snug">
              {message.text}
            </div>
          )}

          {/* Reaction indicator */}
          {isReaction && (
            <div className="text-xs opacity-60 mt-1">Reacted to a message</div>
          )}
        </div>

        {/* Timestamp */}
        {(showTimestamp || isHovered) && (
          <div
            className={`text-xs px-2 transition-opacity duration-200 ${isFromMe ? 'text-right' : 'text-left'}`}
            style={{
              color: 'var(--muted)',
              opacity: showTimestamp || isHovered ? 1 : 0,
            }}
          >
            {formatMessageTimestamp(message.date)}
            {!message.isSent && isFromMe && ' \u00b7 Not sent'}
          </div>
        )}
      </div>
    </div>
  );
}
