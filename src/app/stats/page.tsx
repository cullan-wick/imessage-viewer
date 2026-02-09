'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { TopContactsChart } from '@/components/stats/TopContactsChart';
import { MessagesOverTimeChart } from '@/components/stats/MessagesOverTimeChart';
import { SentReceivedChart } from '@/components/stats/SentReceivedChart';
import { ActivityHoursChart } from '@/components/stats/ActivityHoursChart';
import type { Statistics } from '@/types/database';

export default function StatsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/stats');

        if (!res.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await res.json();

        // Parse dates in the response
        const parsedData: Statistics = {
          ...data,
          overview: {
            ...data.overview,
            dateRange: {
              earliest: data.overview.dateRange.earliest
                ? new Date(data.overview.dateRange.earliest)
                : null,
              latest: data.overview.dateRange.latest
                ? new Date(data.overview.dateRange.latest)
                : null,
            },
          },
        };

        setStats(parsedData);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg text-gray-900 dark:text-white mb-2">Error Loading Statistics</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total messages for overview
  const totalSent = stats.sentVsReceived.sent;
  const totalReceived = stats.sentVsReceived.received;
  const totalMessages = totalSent + totalReceived;

  // Transform data for charts
  const topContactsData = stats.topContacts.map((contact) => ({
    name: contact.name,
    messageCount: contact.messageCount,
  }));

  const messagesOverTimeData = stats.messagesOverTime.map((item) => ({
    month: item.period,
    count: item.count,
    sent: item.sent,
    received: item.received,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Message Statistics
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Insights from your iMessage history
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview */}
        <StatsOverview
          totalMessages={totalMessages}
          totalConversations={stats.overview.totalConversations}
          totalSent={totalSent}
          totalReceived={totalReceived}
          dateRange={stats.overview.dateRange}
        />

        {/* Charts Grid */}
        <div className="mt-8 space-y-8">
          {/* Top row - Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TopContactsChart data={topContactsData} />
            <SentReceivedChart sent={totalSent} received={totalReceived} />
          </div>

          {/* Messages over time - Full width */}
          <MessagesOverTimeChart data={messagesOverTimeData} />

          {/* Activity by hour - Full width */}
          <ActivityHoursChart data={stats.activityByHour} />
        </div>
      </div>
    </div>
  );
}
