'use client';

import { format, subDays, subMonths, subYears, startOfDay } from 'date-fns';

interface DateRangePickerProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangePickerProps) {
  const formatDateForInput = (date: Date | undefined) => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  const handlePreset = (preset: 'week' | 'month' | 'year' | 'all') => {
    const now = new Date();

    switch (preset) {
      case 'week':
        onDateFromChange(startOfDay(subDays(now, 7)));
        onDateToChange(undefined);
        break;
      case 'month':
        onDateFromChange(startOfDay(subMonths(now, 1)));
        onDateToChange(undefined);
        break;
      case 'year':
        onDateFromChange(startOfDay(subYears(now, 1)));
        onDateToChange(undefined);
        break;
      case 'all':
        onDateFromChange(undefined);
        onDateToChange(undefined);
        break;
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date Range
        </label>

        {/* Preset buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => handlePreset('week')}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Last 7 days
          </button>
          <button
            onClick={() => handlePreset('month')}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Last month
          </button>
          <button
            onClick={() => handlePreset('year')}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Last year
          </button>
          <button
            onClick={() => handlePreset('all')}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            All time
          </button>
        </div>
      </div>

      {/* From date */}
      <div>
        <label htmlFor="date-from" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          From
        </label>
        <input
          id="date-from"
          type="date"
          value={formatDateForInput(dateFrom)}
          onChange={(e) => onDateFromChange(e.target.value ? new Date(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* To date */}
      <div>
        <label htmlFor="date-to" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          To
        </label>
        <input
          id="date-to"
          type="date"
          value={formatDateForInput(dateTo)}
          onChange={(e) => onDateToChange(e.target.value ? new Date(e.target.value) : undefined)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
