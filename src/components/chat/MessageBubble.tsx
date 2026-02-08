'use client';

import type { Message } from '@/types/database';
import { formatMessageTimestamp } from '@/lib/utils/date-conversion';
import { formatContactIdentifier } from '@/lib/utils/format';
import { AttachmentPreview } from './AttachmentPreview';
import { useState } from 'react';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: Message;
  position?: 'first' | 'middle' | 'last' | 'single';
  showTimestamp?: boolean;
  showSender?: boolean;
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

  // Don't render messages with no text and no attachments (empty bubbles)
  if (!hasText && !hasAttachments) {
    return null;
  }

  // Different styling for sent (blue) vs received (gray) messages
  const bubbleClasses = clsx(
    'inline-block px-4 py-2 max-w-[65%] break-words',
    {
      // Sent messages (blue)
      'bg-[#0B93F6] text-white': isFromMe,
      // Received messages (gray)
      'bg-[#E5E5EA] dark:bg-[#3A3A3C] text-black dark:text-white': !isFromMe,

      // Rounded corners based on position in group
      // Single message (not grouped) - all corners fully rounded
      'rounded-[18px]': position === 'single',

      // First in group - bottom tail corner less rounded
      'rounded-[18px]': position === 'first',
      'rounded-br-[4px]': position === 'first' && isFromMe,
      'rounded-bl-[4px]': position === 'first' && !isFromMe,

      // Middle in group - both tail corners less rounded
      'rounded-[18px]': position === 'middle',
      'rounded-br-[4px] rounded-tr-[4px]': position === 'middle' && isFromMe,
      'rounded-bl-[4px] rounded-tl-[4px]': position === 'middle' && !isFromMe,

      // Last in group - top tail corner less rounded
      'rounded-[18px]': position === 'last',
      'rounded-tr-[4px]': position === 'last' && isFromMe,
      'rounded-tl-[4px]': position === 'last' && !isFromMe,
    }
  );

  // Handle special message types
  const isReaction = message.associatedMessageGuid !== null;
  const hasExpressiveStyle = message.expressiveSendStyleId !== null;

  return (
    <div
      className={clsx('flex', {
        'justify-end': isFromMe,
        'justify-start': !isFromMe,
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col gap-1 max-w-[70%]">
        {/* Sender name (for received messages) */}
        {showSender && !isFromMe && (
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 mb-1">
            {message.senderName || (message.senderId ? formatContactIdentifier(message.senderId) : 'Unknown')}
          </div>
        )}

        {/* Message bubble */}
        <div className={bubbleClasses}>
          {/* Attachments */}
          {message.hasAttachments && message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              {message.attachments.map((attachment) => (
                <AttachmentPreview key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}

          {/* Text content */}
          {hasText && (
            <div
              className={clsx('whitespace-pre-wrap', {
                // Add effects for expressive send styles
                'animate-pulse': hasExpressiveStyle === 'com.apple.messages.effect.CKConfettiEffect',
                'font-bold text-lg': hasExpressiveStyle === 'com.apple.messages.effect.CKHappyBirthdayEffect',
              })}
            >
              {message.text}
            </div>
          )}

          {/* Reaction indicator */}
          {isReaction && (
            <div className="text-xs opacity-70 mt-1">
              Reacted to a message
            </div>
          )}
        </div>

        {/* Timestamp (on hover or if showTimestamp is true) */}
        {(showTimestamp || isHovered) && (
          <div
            className={clsx(
              'text-xs text-gray-500 dark:text-gray-400 px-2 transition-opacity',
              {
                'text-right': isFromMe,
                'text-left': !isFromMe,
                'opacity-100': showTimestamp || isHovered,
                'opacity-0': !showTimestamp && !isHovered,
              }
            )}
          >
            {formatMessageTimestamp(message.date)}
            {!message.isSent && isFromMe && ' • Not sent'}
          </div>
        )}
      </div>
    </div>
  );
}
