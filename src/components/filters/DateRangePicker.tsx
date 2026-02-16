'use client';

import { format, subDays, subMonths, subYears, startOfDay } from 'date-fns';

interface DateRangePickerProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
}

export function DateRangePicker({ dateFrom, dateTo, onDateFromChange, onDateToChange }: DateRangePickerProps) {
  const formatDateForInput = (date: Date | undefined) => date ? format(date, 'yyyy-MM-dd') : '';

  const presets = [
    { label: '7 days', action: () => { onDateFromChange(startOfDay(subDays(new Date(), 7))); onDateToChange(undefined); }},
    { label: '30 days', action: () => { onDateFromChange(startOfDay(subMonths(new Date(), 1))); onDateToChange(undefined); }},
    { label: '1 year', action: () => { onDateFromChange(startOfDay(subYears(new Date(), 1))); onDateToChange(undefined); }},
    { label: 'All time', action: () => { onDateFromChange(undefined); onDateToChange(undefined); }},
  ];

  const inputStyle = {
    background: 'var(--background)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Date Range</label>

      <div className="grid grid-cols-2 gap-1.5">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={p.action}
            className="px-2.5 py-1.5 text-xs rounded-md transition-colors"
            style={{ background: 'var(--background)', color: 'var(--muted)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--foreground)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.color = 'var(--muted)'; }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div>
          <label className="block text-[11px] mb-1" style={{ color: 'var(--muted)' }}>From</label>
          <input
            type="date"
            value={formatDateForInput(dateFrom)}
            onChange={(e) => onDateFromChange(e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full px-2.5 py-1.5 rounded-md text-xs focus:outline-none focus-ring"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-[11px] mb-1" style={{ color: 'var(--muted)' }}>To</label>
          <input
            type="date"
            value={formatDateForInput(dateTo)}
            onChange={(e) => onDateToChange(e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full px-2.5 py-1.5 rounded-md text-xs focus:outline-none focus-ring"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
