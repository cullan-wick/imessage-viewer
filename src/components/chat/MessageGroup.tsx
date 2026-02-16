'use client';

import type { Message } from '@/types/database';
import { MessageBubble } from './MessageBubble';
import { getInitials, getContactColor } from '@/lib/utils/format';

interface MessageGroupProps {
  messages: Message[];
  showSender?: boolean;
}

export function MessageGroup({ messages, showSender = false }: MessageGroupProps) {
  if (messages.length === 0) return null;

  const firstMessage = messages[0];
  const isFromMe = firstMessage.isFromMe;
  const senderName = firstMessage.senderName || firstMessage.senderId || 'Unknown';
  const senderInitials = getInitials(senderName);
  const senderColor = getContactColor(firstMessage.senderId || 'unknown');

  return (
    <div className="flex gap-2 mb-1">
      {/* Avatar for received messages */}
      {!isFromMe && showSender && (
        <div className="flex-shrink-0 mt-auto mb-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ${senderColor}`}
          >
            {senderInitials.slice(0, 2)}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 flex flex-col gap-[2px]">
        {messages.map((message, index) => {
          let position: 'first' | 'middle' | 'last' | 'single' = 'single';
          if (messages.length > 1) {
            if (index === 0) position = 'first';
            else if (index === messages.length - 1) position = 'last';
            else position = 'middle';
          }

          return (
            <MessageBubble
              key={message.id}
              message={message}
              position={position}
              showTimestamp={index === messages.length - 1}
              showSender={showSender && index === 0}
            />
          );
        })}
      </div>

      {/* Spacer for sent messages */}
      {isFromMe && showSender && <div className="flex-shrink-0 w-7" />}
    </div>
  );
}
