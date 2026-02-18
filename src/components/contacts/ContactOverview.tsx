'use client';

interface ContactOverviewProps {
  messageCount: number;
  sentCount: number;
  receivedCount: number;
  mediaCount: number;
  longestStreak: number;
  currentStreak: number;
  firstMessageDate: string | null;
  lastMessageDate: string | null;
}

export function ContactOverview({
  messageCount,
  sentCount,
  receivedCount,
  mediaCount,
  longestStreak,
  currentStreak,
  firstMessageDate,
  lastMessageDate,
}: ContactOverviewProps) {
  const fmt = (num: number) => new Intl.NumberFormat('en-US').format(num);

  const formatDateRange = () => {
    if (!firstMessageDate || !lastMessageDate) return 'No data';
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return `${new Date(firstMessageDate).toLocaleDateString('en-US', opts)} \u2013 ${new Date(lastMessageDate).toLocaleDateString('en-US', opts)}`;
  };

  const cards = [
    { label: 'Total Messages', value: fmt(messageCount), color: 'var(--accent)' },
    { label: 'Sent', value: fmt(sentCount), color: 'var(--accent)' },
    { label: 'Received', value: fmt(receivedCount), color: 'var(--muted)' },
    { label: 'Media Shared', value: fmt(mediaCount), color: 'var(--green)' },
    { label: 'Best Streak', value: `${longestStreak}d`, color: 'var(--orange)' },
    { label: 'Current Streak', value: `${currentStreak}d`, color: 'var(--purple)' },
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
