'use client';

import { formatDateDivider } from '@/lib/utils/date-conversion';

interface DateDividerProps {
  date: Date;
}

export function DateDivider({ date }: DateDividerProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-center py-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <div className="flex items-center gap-4 w-full max-w-4xl px-4">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {formatDateDivider(date)}
        </div>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
