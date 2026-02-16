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
  const fmt = (num: number) => new Intl.NumberFormat('en-US').format(num);

  const formatDateRange = () => {
    if (!dateRange.earliest || !dateRange.latest) return 'No data';
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return `${dateRange.earliest.toLocaleDateString('en-US', opts)} \u2013 ${dateRange.latest.toLocaleDateString('en-US', opts)}`;
  };

  const cards = [
    { label: 'Total Messages', value: fmt(totalMessages), color: 'var(--accent)' },
    { label: 'Conversations', value: fmt(totalConversations), color: 'var(--green)' },
    { label: 'Sent', value: fmt(totalSent), color: 'var(--accent)' },
    { label: 'Received', value: fmt(totalReceived), color: 'var(--muted)' },
  ];

  return (
    <div>
      {/* Date range badge */}
      <div className="mb-5 flex items-center gap-2">
        <svg className="w-4 h-4" style={{ color: 'var(--purple)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          {formatDateRange()}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="text-2xl font-bold tracking-tight"
              style={{ color: card.color }}
            >
              {card.value}
            </div>
            <div className="text-xs mt-1 font-medium" style={{ color: 'var(--muted)' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
