'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { TopContactsChart } from '@/components/stats/TopContactsChart';
import { MessagesOverTimeChart } from '@/components/stats/MessagesOverTimeChart';
import { SentReceivedChart } from '@/components/stats/SentReceivedChart';
import { ActivityHoursChart } from '@/components/stats/ActivityHoursChart';
import { StreakChart } from '@/components/stats/StreakChart';
import type { Statistics, TopContactsPeriod } from '@/types/database';

export default function StatsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch statistics');

        const data = await res.json();
        setStats({
          ...data,
          overview: {
            ...data.overview,
            dateRange: {
              earliest: data.overview.dateRange.earliest ? new Date(data.overview.dateRange.earliest) : null,
              latest: data.overview.dateRange.latest ? new Date(data.overview.dateRange.latest) : null,
            },
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center animate-fade-in">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center animate-fade-in">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <svg className="w-6 h-6" style={{ color: 'var(--red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Error Loading Statistics</p>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{error}</p>
          <Link
            href="/"
            className="text-sm font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  const totalSent = stats.sentVsReceived.sent;
  const totalReceived = stats.sentVsReceived.received;
  const totalMessages = totalSent + totalReceived;

  const topContactsByPeriodData = Object.fromEntries(
    Object.entries(stats.topContactsByPeriod).map(([period, contacts]) => [
      period,
      contacts.map((contact) => ({
        name: contact.name,
        messageCount: contact.messageCount,
      })),
    ])
  ) as Record<TopContactsPeriod, Array<{ name: string; messageCount: number }>>;

  const messagesOverTimeData = stats.messagesOverTime.map((item) => ({
    month: item.period,
    count: item.count,
    sent: item.sent,
    received: item.received,
  }));

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 glass"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--muted)' }}
              title="Back to Messages"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                Analytics
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Insights from your message history
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 animate-slide-up">
        <StatsOverview
          totalMessages={totalMessages}
          totalConversations={stats.overview.totalConversations}
          totalSent={totalSent}
          totalReceived={totalReceived}
          dateRange={stats.overview.dateRange}
        />

        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopContactsChart dataByPeriod={topContactsByPeriodData} />
            <SentReceivedChart sent={totalSent} received={totalReceived} />
          </div>
          <StreakChart data={stats.streaks} />
          <MessagesOverTimeChart data={messagesOverTimeData} />
          <ActivityHoursChart data={stats.activityByHour} />
        </div>
      </div>
    </div>
  );
}
