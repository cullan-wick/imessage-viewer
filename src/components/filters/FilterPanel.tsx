'use client';

import { DateRangePicker } from './DateRangePicker';
import { FilterDropdowns } from './FilterDropdowns';
import type { SearchFilters } from '@/types/database';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function FilterPanel({ filters, onFiltersChange, isOpen = true, onToggle }: FilterPanelProps) {
  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    (filters.direction && filters.direction !== 'all') ||
    filters.hasAttachment !== undefined ||
    (filters.chatType && filters.chatType !== 'all') ||
    (filters.personIds && filters.personIds.length > 0);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div
      className="flex-shrink-0 transition-all duration-200 overflow-hidden"
      style={{
        width: isOpen ? 280 : 0,
        borderLeft: isOpen ? '1px solid var(--border)' : 'none',
        background: 'var(--surface)',
      }}
    >
      {isOpen && (
        <div className="h-full flex flex-col w-[280px] animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Filters</h2>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={() => onFiltersChange({})}
                    className="text-xs font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    Clear all
                  </button>
                )}
                {onToggle && (
                  <button
                    onClick={onToggle}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--muted)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            <DateRangePicker
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onDateFromChange={(date) => onFiltersChange({ ...filters, dateFrom: date })}
              onDateToChange={(date) => onFiltersChange({ ...filters, dateTo: date })}
            />

            <div style={{ borderTop: '1px solid var(--border)' }} />

            <FilterDropdowns
              direction={filters.direction || 'all'}
              onDirectionChange={(direction) =>
                onFiltersChange({ ...filters, direction: direction === 'all' ? undefined : direction })
              }
              hasAttachment={filters.hasAttachment}
              onHasAttachmentChange={(hasAttachment) =>
                onFiltersChange({ ...filters, hasAttachment })
              }
              chatType={filters.chatType || 'all'}
              onChatTypeChange={(chatType) =>
                onFiltersChange({ ...filters, chatType: chatType === 'all' ? undefined : chatType })
              }
            />
          </div>

          {/* Active filter count */}
          {hasActiveFilters && (
            <div className="px-4 py-2.5 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--accent-soft)' }}>
              <div className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                {activeCount} active {activeCount === 1 ? 'filter' : 'filters'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
