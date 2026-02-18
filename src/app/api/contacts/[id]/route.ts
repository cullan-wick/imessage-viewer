import { NextRequest, NextResponse } from 'next/server';
import { getContactAnalytics } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/contacts/[id]
 * Get detailed analytics for a single contact
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const identifier = decodeURIComponent(id);

    const analytics = getContactAnalytics(identifier);

    if (!analytics) {
      return NextResponse.json(
        { error: 'Not Found', message: `Contact "${identifier}" not found or has no messages` },
        { status: 404 }
      );
    }

    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('[API] Error fetching contact analytics:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch contact analytics',
      },
      { status: 500 }
    );
  }
}
