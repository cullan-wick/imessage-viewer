'use client';

import type { Conversation } from '@/types/database';
import { formatConversationDate } from '@/lib/utils/date-conversion';
import { formatMessagePreview, getInitials, getContactColor } from '@/lib/utils/format';
import { useRouter, useSearchParams } from 'next/navigation';

interface ConversationItemProps {
  conversation: Conversation;
  onSelect?: (conversation: Conversation) => void;
}

export function ConversationItem({ conversation, onSelect }: ConversationItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get('chat');
  const isActive = currentChatId === conversation.id.toString();

  const handleClick = () => {
    onSelect?.(conversation);
    router.push(`/?chat=${conversation.id}`);
  };

  const displayName = conversation.displayName || 'Unknown';
  const initials = getInitials(displayName);
  const avatarColor = getContactColor(conversation.chatIdentifier);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150"
      style={{
        background: isActive ? 'var(--accent-soft)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--surface-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {conversation.isGroup ? (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted-light)' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        ) : (
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm ${avatarColor}`}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: isActive ? 'var(--accent)' : 'var(--foreground)' }}
          >
            {displayName}
          </h3>
          {conversation.lastMessageDate && (
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>
              {formatConversationDate(conversation.lastMessageDate)}
            </span>
          )}
        </div>
        <p className="text-sm truncate mt-0.5" style={{ color: 'var(--muted)' }}>
          {conversation.lastMessageIsFromMe && (
            <span style={{ color: 'var(--muted-light)' }}>You: </span>
          )}
          {formatMessagePreview(conversation.lastMessageText)}
        </p>
        {conversation.isGroup && conversation.participants.length > 0 && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-light)' }}>
            {conversation.participants.length} members
          </p>
        )}
      </div>
    </div>
  );
}
