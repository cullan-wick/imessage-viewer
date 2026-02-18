import { NextResponse } from 'next/server';
import { getContactList } from '@/lib/db/queries';
import type { ContactListResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/contacts
 * Get all contacts with message counts, sorted by total messages desc
 */
export async function GET() {
  try {
    const contacts = getContactList();

    const response: ContactListResponse = { contacts };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('[API] Error fetching contacts:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch contacts',
      },
      { status: 500 }
    );
  }
}
