'use client';

import { useState, useMemo } from 'react';
import type { ContactListEntry } from '@/types/database';
import { Virtuoso } from 'react-virtuoso';

interface ContactListProps {
  contacts: ContactListEntry[];
  selected: string | null;
  onSelect: (identifier: string) => void;
  isLoading: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ContactList({ contacts, selected, onSelect, isLoading }: ContactListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm) return contacts;
    const lower = searchTerm.toLowerCase();
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.identifier.toLowerCase().includes(lower)
    );
  }, [contacts, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--muted-light)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none transition-colors"
            style={{
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-hidden min-h-0">
        {isLoading ? (
          <div className="px-3 py-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <div className="w-10 h-10 rounded-full animate-shimmer flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3.5 animate-shimmer rounded w-28" />
                  <div className="h-3 animate-shimmer rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex justify-center items-center h-full px-4">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {searchTerm ? 'No contacts match your search' : 'No contacts found'}
            </p>
          </div>
        ) : (
          <Virtuoso
            data={filtered}
            itemContent={(_, contact) => {
              const isSelected = contact.identifier === selected;
              return (
                <button
                  onClick={() => onSelect(contact.identifier)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    background: isSelected ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--accent-soft)',
                      color: isSelected ? 'white' : 'var(--accent)',
                    }}
                  >
                    {getInitials(contact.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: isSelected ? 'white' : 'var(--foreground)' }}
                    >
                      {contact.name}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}
                    >
                      {new Intl.NumberFormat('en-US').format(contact.messageCount)} messages
                    </div>
                  </div>
                </button>
              );
            }}
            style={{ height: '100%' }}
          />
        )}
      </div>
    </div>
  );
}
