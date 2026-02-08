'use client';

import type { Conversation } from '@/types/database';
import { formatConversationDate } from '@/lib/utils/date-conversion';
import { formatMessagePreview, getInitials, getContactColor } from '@/lib/utils/format';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get('chat');
  const isActive = currentChatId === conversation.id.toString();

  const handleClick = () => {
    router.push(`/?chat=${conversation.id}`);
  };

  const displayName = conversation.displayName || 'Unknown';
  const initials = getInitials(displayName);
  const avatarColor = getContactColor(conversation.chatIdentifier);

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        {
          'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500': isActive,
          'border-l-4 border-transparent': !isActive,
        }
      )}
      onClick={handleClick}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {conversation.isGroup ? (
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        ) : (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${avatarColor}`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className={clsx('font-semibold truncate', {
              'text-gray-900 dark:text-white': isActive,
              'text-gray-700 dark:text-gray-200': !isActive,
            })}
          >
            {displayName}
          </h3>
          {conversation.lastMessageDate && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
              {formatConversationDate(conversation.lastMessageDate)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {conversation.lastMessageIsFromMe && 'You: '}
            {formatMessagePreview(conversation.lastMessageText)}
          </p>

          {/* Unread badge (if we had unread count) */}
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          )}
        </div>

        {/* Group member count */}
        {conversation.isGroup && conversation.participants.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            {conversation.participants.length} members
          </p>
        )}
      </div>
    </div>
  );
}
