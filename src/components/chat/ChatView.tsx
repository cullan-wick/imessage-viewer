'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, Conversation } from '@/types/database';
import { MessageGroup } from './MessageGroup';
import { DateDivider } from './DateDivider';
import { groupMessagesByDay, isSameDay } from '@/lib/utils/date-conversion';

interface ChatViewProps {
  chatId: number;
  conversation: Conversation | null;
}

export function ChatView({ chatId, conversation }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
          // Messages come in DESC order (newest first), but we want to display oldest first
          const sortedMessages = [...data.messages].reverse();
          setMessages(sortedMessages);
          setHasMore(data.hasMore);
        }
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
      })
      .finally(() => {
        setIsLoading(false);
        // Scroll to bottom after initial load
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        }, 100);
      });
  }, [chatId]);

  // Load more messages when scrolling to top
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore || !messages.length) return;

    setIsLoadingMore(true);

    // Get the oldest message date
    const oldestMessage = messages[0];
    const beforeDate = oldestMessage.date.toISOString();

    try {
      const res = await fetch(`/api/messages/${chatId}?limit=50&before=${beforeDate}`);
      const data = await res.json();

      if (data.messages && data.messages.length > 0) {
        // Store current scroll position
        if (scrollContainerRef.current) {
          previousScrollHeight.current = scrollContainerRef.current.scrollHeight;
        }

        // Messages come in DESC order, reverse them
        const olderMessages = [...data.messages].reverse();
        setMessages((prev) => [...olderMessages, ...prev]);
        setHasMore(data.hasMore);

        // Restore scroll position after new messages are added
        setTimeout(() => {
          if (scrollContainerRef.current) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            const scrollDiff = newScrollHeight - previousScrollHeight.current;
            scrollContainerRef.current.scrollTop = scrollDiff;
          }
        }, 0);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, messages, hasMore, isLoadingMore]);

  // Handle scroll event for infinite scroll
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingMore) return;

    const { scrollTop } = scrollContainerRef.current;

    // Load more when scrolled near the top
    if (scrollTop < 200 && hasMore) {
      loadMoreMessages();
    }
  }, [hasMore, isLoadingMore, loadMoreMessages]);

  // Group messages by day and by sender
  const groupedMessages = groupMessagesByDay(messages);

  // Group consecutive messages from the same sender
  const groupMessagesBySender = (msgs: Message[]): Message[][] => {
    if (msgs.length === 0) return [];

    const groups: Message[][] = [];
    let currentGroup: Message[] = [msgs[0]];

    for (let i = 1; i < msgs.length; i++) {
      const prevMsg = msgs[i - 1];
      const currMsg = msgs[i];

      // Check if messages are from the same sender and within 1 minute
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

  // Empty state
  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg font-medium">Select a conversation to start</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-black h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {conversation?.displayName || 'Unknown'}
          </h2>
          {conversation && conversation.participants.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {conversation.participants.map((p) => p.contactId).join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4"
        onScroll={handleScroll}
      >
        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {/* Messages */}
        {!isLoading && (
          <>
            {Array.from(groupedMessages.entries()).map(([dayKey, dayMessages]) => {
              const messageGroups = groupMessagesBySender(dayMessages);

              return (
                <div key={dayKey}>
                  <DateDivider date={dayMessages[0].date} />
                  <div className="space-y-2">
                    {messageGroups.map((group, idx) => (
                      <MessageGroup
                        key={`${dayKey}-${idx}`}
                        messages={group}
                        showSender={conversation?.isGroup}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Empty state for no messages */}
        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>No messages in this conversation</p>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
