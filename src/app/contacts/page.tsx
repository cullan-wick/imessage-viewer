'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import type { ContactListEntry } from '@/types/database';
import { ContactList } from '@/components/contacts/ContactList';
import { ContactDetail } from '@/components/contacts/ContactDetail';

function ContactsContent() {
  const [contacts, setContacts] = useState<ContactListEntry[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/contacts');
        if (!res.ok) throw new Error('Failed to fetch contacts');
        const data = await res.json();
        setContacts(data.contacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <div className="flex flex-col h-full flex-shrink-0" style={{ width: '18rem', borderRight: '1px solid var(--border)', background: 'var(--surface)' }}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/"
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--muted)' }}
              title="Back to Messages"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Contacts
            </h1>
          </div>
        </div>

        {/* Contact list (fills remaining space) */}
        <div className="flex-1 min-h-0">
          <ContactList
            contacts={contacts}
            selected={selectedContact}
            onSelect={setSelectedContact}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Detail panel */}
      <ContactDetail identifier={selectedContact} />
    </div>
  );
}

export default function ContactsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center" style={{ background: 'var(--background)' }}>
          <div className="animate-pulse-gentle" style={{ color: 'var(--muted)' }}>
            Loading...
          </div>
        </div>
      }
    >
      <ContactsContent />
    </Suspense>
  );
}
