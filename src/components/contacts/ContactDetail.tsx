'use client';

import { useState, useEffect } from 'react';
import type { ContactAnalytics } from '@/types/database';
import { ContactOverview } from './ContactOverview';
import { ContactTimelineChart } from './ContactTimelineChart';
import { ContactActivityChart } from './ContactActivityChart';
import { CumulativeChart } from '@/components/stats/CumulativeChart';

interface ContactDetailProps {
  identifier: string | null;
}

export function ContactDetail({ identifier }: ContactDetailProps) {
  const [analytics, setAnalytics] = useState<ContactAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) {
      setAnalytics(null);
      return;
    }

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/contacts/${encodeURIComponent(identifier)}`);
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Contact not found' : 'Failed to load analytics');
        }
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [identifier]);

  if (!identifier) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <svg className="w-9 h-9" style={{ color: 'var(--muted-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Select a contact
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Choose from the sidebar to view analytics
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--background)' }}>
        <div className="space-y-6 animate-fade-in">
          {/* Shimmer cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="h-7 w-20 animate-shimmer rounded mb-2" />
                <div className="h-3 w-16 animate-shimmer rounded" />
              </div>
            ))}
          </div>
          {/* Shimmer chart */}
          <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="h-4 w-32 animate-shimmer rounded mb-4" />
            <div className="h-64 animate-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--red, #FF3B30)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Name header */}
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          {analytics.name}
        </h2>

        <ContactOverview
          messageCount={analytics.messageCount}
          sentCount={analytics.sentCount}
          receivedCount={analytics.receivedCount}
          mediaCount={analytics.mediaCount}
          longestStreak={analytics.streak.longestStreak}
          currentStreak={analytics.streak.currentStreak}
          firstMessageDate={analytics.firstMessageDate as unknown as string}
          lastMessageDate={analytics.lastMessageDate as unknown as string}
        />

        <ContactTimelineChart data={analytics.messagesOverTime} />

        <CumulativeChart data={analytics.messagesOverTime} />

        <ContactActivityChart data={analytics.activityByHour} />
      </div>
    </div>
  );
}
