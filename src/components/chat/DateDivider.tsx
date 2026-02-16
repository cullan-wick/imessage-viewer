'use client';

import { formatDateDivider } from '@/lib/utils/date-conversion';

interface DateDividerProps {
  date: Date;
}

export function DateDivider({ date }: DateDividerProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{
          background: 'var(--surface)',
          color: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        {formatDateDivider(date)}
      </div>
    </div>
  );
}
