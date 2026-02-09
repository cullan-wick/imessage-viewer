'use client';

import { useState } from 'react';
import { DateRangePicker } from './DateRangePicker';
import { FilterDropdowns } from './FilterDropdowns';
import type { SearchFilters } from '@/types/database';
import clsx from 'clsx';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function FilterPanel({ filters, onFiltersChange, isOpen = true, onToggle }: FilterPanelProps) {
  const handleClearAll = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    (filters.direction && filters.direction !== 'all') ||
    filters.hasAttachment !== undefined ||
    (filters.chatType && filters.chatType !== 'all') ||
    (filters.personIds && filters.personIds.length > 0);

  return (
    <div
      className={clsx(
        'flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-all duration-300',
        {
          'w-80': isOpen,
          'w-0 overflow-hidden': !isOpen,
        }
      )}
    >
      {isOpen && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
              {onToggle && (
                <button
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  title="Close filters"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Clear all button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
            {/* Date range */}
            <DateRangePicker
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onDateFromChange={(date) => onFiltersChange({ ...filters, dateFrom: date })}
              onDateToChange={(date) => onFiltersChange({ ...filters, dateTo: date })}
            />

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Dropdowns */}
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
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {Object.values(filters).filter(Boolean).length} active{' '}
                {Object.values(filters).filter(Boolean).length === 1 ? 'filter' : 'filters'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
