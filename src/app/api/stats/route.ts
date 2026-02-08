import { NextResponse } from 'next/server';
import { getStatistics } from '@/lib/db/queries';
import type { StatsResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stats
 * Get aggregate statistics about all messages
 *
 * Returns:
 * - Overview stats (total messages, conversations, attachments, date range)
 * - Top contacts by message count
 * - Messages over time (monthly breakdown)
 * - Sent vs received ratio
 * - Activity by hour of day
 * - Activity by day of week
 */
export async function GET() {
  try {
    const stats = getStatistics();

    const response: StatsResponse = stats;

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('[API] Error fetching statistics:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch statistics',
      },
      { status: 500 }
    );
  }
}
