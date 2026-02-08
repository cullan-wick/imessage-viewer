'use client';

import type { Message } from '@/types/database';
import { formatMessageTimestamp } from '@/lib/utils/date-conversion';
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

  // Different styling for sent (blue) vs received (gray) messages
  const bubbleClasses = clsx(
    'inline-block px-4 py-2 max-w-[65%] break-words',
    {
      // Sent messages (blue)
      'bg-[#0B93F6] text-white': isFromMe,
      // Received messages (gray)
      'bg-[#E5E5EA] dark:bg-[#3A3A3C] text-black dark:text-white': !isFromMe,

      // Rounded corners based on position in group
      // Single message (not grouped)
      'rounded-2xl': position === 'single',

      // First in group
      'rounded-2xl': position === 'first',
      'rounded-br-md': position === 'first' && isFromMe,
      'rounded-bl-md': position === 'first' && !isFromMe,

      // Middle in group
      'rounded-2xl': position === 'middle',
      'rounded-br-md rounded-tr-md': position === 'middle' && isFromMe,
      'rounded-bl-md rounded-tl-md': position === 'middle' && !isFromMe,

      // Last in group
      'rounded-2xl': position === 'last',
      'rounded-tr-md': position === 'last' && isFromMe,
      'rounded-tl-md': position === 'last' && !isFromMe,
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
        {/* Sender name (for group chats) */}
        {showSender && !isFromMe && message.senderName && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
            {message.senderName || message.senderId}
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
