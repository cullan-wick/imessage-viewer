'use client';

interface StatsOverviewProps {
  totalMessages: number;
  totalConversations: number;
  totalSent: number;
  totalReceived: number;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
}

export function StatsOverview({
  totalMessages,
  totalConversations,
  totalSent,
  totalReceived,
  dateRange,
}: StatsOverviewProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDateRange = () => {
    if (!dateRange.earliest || !dateRange.latest) return 'No data';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    const earliest = dateRange.earliest.toLocaleDateString('en-US', options);
    const latest = dateRange.latest.toLocaleDateString('en-US', options);

    return `${earliest} - ${latest}`;
  };

  const cards = [
    {
      title: 'Total Messages',
      value: formatNumber(totalMessages),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Conversations',
      value: formatNumber(totalConversations),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Messages Sent',
      value: formatNumber(totalSent),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Messages Received',
      value: formatNumber(totalReceived),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16l-4-4m0 0l4-4m-4 4h18"
          />
        </svg>
      ),
      color: 'gray',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    gray: 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400',
  };

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                {card.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {card.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* Date range */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date Range</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDateRange()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
