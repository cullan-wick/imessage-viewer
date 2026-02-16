'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, Conversation } from '@/types/database';
import { MessageGroup } from './MessageGroup';
import { DateDivider } from './DateDivider';
import { MediaGallery } from '../media/MediaGallery';
import { groupMessagesByDay } from '@/lib/utils/date-conversion';

interface ChatViewProps {
  chatId: number;
  conversation: Conversation | null;
}

export function ChatView({ chatId, conversation }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);

  // Fetch initial messages when chat changes
  useEffect(() => {
    if (!chatId) return;

    setIsLoading(true);
    setMessages([]);

    fetch(`/api/messages/${chatId}?limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) {
          const parsedMessages = data.messages.map((msg: any) => ({
            ...msg,
            date: new Date(msg.date),
          }));
          // Messages come DESC, display oldest first
          setMessages([...parsedMessages].reverse());
          setHasMore(data.hasMore);
        }
      })
      .catch((error) => console.error('Error fetching messages:', error))
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        }, 100);
      });
  }, [chatId]);

  // Load more messages on scroll to top
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore || !messages.length) return;

    setIsLoadingMore(true);
    const oldestMessage = messages[0];
    const beforeDate = oldestMessage.date.toISOString();

    try {
      const res = await fetch(`/api/messages/${chatId}?limit=50&before=${beforeDate}`);
      const data = await res.json();

      if (data.messages && data.messages.length > 0) {
        if (scrollContainerRef.current) {
          previousScrollHeight.current = scrollContainerRef.current.scrollHeight;
        }

        const parsedMessages = data.messages.map((msg: any) => ({
          ...msg,
          date: new Date(msg.date),
        }));

        const olderMessages = [...parsedMessages].reverse();
        setMessages((prev) => [...olderMessages, ...prev]);
        setHasMore(data.hasMore);

        setTimeout(() => {
          if (scrollContainerRef.current) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight.current;
          }
        }, 0);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, messages, hasMore, isLoadingMore]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingMore) return;
    if (scrollContainerRef.current.scrollTop < 200 && hasMore) {
      loadMoreMessages();
    }
  }, [hasMore, isLoadingMore, loadMoreMessages]);

  // Group messages by day and by sender
  const groupedMessages = groupMessagesByDay(messages);

  const groupMessagesBySender = (msgs: Message[]): Message[][] => {
    if (msgs.length === 0) return [];
    const groups: Message[][] = [];
    let currentGroup: Message[] = [msgs[0]];

    for (let i = 1; i < msgs.length; i++) {
      const prevMsg = msgs[i - 1];
      const currMsg = msgs[i];
      const timeDiff = (currMsg.date.getTime() - prevMsg.date.getTime()) / 1000;
      const sameSender = prevMsg.isFromMe === currMsg.isFromMe && prevMsg.senderId === currMsg.senderId;

      if (sameSender && timeDiff < 60) {
        currentGroup.push(currMsg);
      } else {
        groups.push(currentGroup);
        currentGroup = [currMsg];
      }
    }
    groups.push(currentGroup);
    return groups;
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <p style={{ color: 'var(--muted)' }}>Select a conversation</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold truncate" style={{ color: 'var(--foreground)' }}>
            {conversation?.displayName || 'Loading...'}
          </h2>
          {conversation && conversation.participants.length > 0 && (
            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
              {conversation.participants.map((p) => p.contactId).join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: 'var(--muted)' }}
          title="Media Gallery"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        onScroll={handleScroll}
      >
        {isLoadingMore && (
          <div className="flex justify-center py-4 animate-fade-in">
            <div
              className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {!isLoading && (
          <div className="max-w-3xl mx-auto">
            {Array.from(groupedMessages.entries()).map(([dayKey, dayMessages]) => {
              const messageGroups = groupMessagesBySender(dayMessages);
              return (
                <div key={dayKey}>
                  <DateDivider date={dayMessages[0].date} />
                  <div className="space-y-1.5">
                    {messageGroups.map((group, idx) => (
                      <MessageGroup key={`${dayKey}-${idx}`} messages={group} showSender={true} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No messages in this conversation</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Gallery */}
      <MediaGallery chatId={chatId} isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
    </div>
  );
}
