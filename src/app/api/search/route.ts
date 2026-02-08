import { NextRequest, NextResponse } from 'next/server';
import { searchMessages, isSearchIndexBuilt } from '@/lib/db/search-index';
import type { SearchResponse } from '@/types/api';
import type { SearchFilters } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search
 * Full-text search across all messages
 *
 * Query params:
 * - q: string (required) - search query
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 * - dateFrom: string (ISO date, optional)
 * - dateTo: string (ISO date, optional)
 * - personId: string (handle ID, optional)
 * - direction: 'sent' | 'received' | 'all' (default: 'all')
 * - hasAttachment: 'true' | 'false' (optional)
 * - chatType: 'all' | 'group' | 'individual' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get('q');
    if (!query) {
      return NextResponse.json(
        { error: 'Missing query', message: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    // Check if search index is built
    if (!isSearchIndexBuilt()) {
      return NextResponse.json(
        {
          error: 'Search index not built',
          message: 'Search index has not been initialized. Please build the index first.',
        },
        { status: 503 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit', message: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset', message: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Build filters
    const filters: SearchFilters = {};

    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) {
      const date = new Date(dateFrom);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid dateFrom', message: 'dateFrom must be a valid ISO date string' },
          { status: 400 }
        );
      }
      filters.dateFrom = date;
    }

    const dateTo = searchParams.get('dateTo');
    if (dateTo) {
      const date = new Date(dateTo);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid dateTo', message: 'dateTo must be a valid ISO date string' },
          { status: 400 }
        );
      }
      filters.dateTo = date;
    }

    const personId = searchParams.get('personId');
    if (personId) {
      filters.personIds = [parseInt(personId, 10)];
    }

    const direction = searchParams.get('direction');
    if (direction && ['sent', 'received', 'all'].includes(direction)) {
      filters.direction = direction as 'sent' | 'received' | 'all';
    }

    const hasAttachment = searchParams.get('hasAttachment');
    if (hasAttachment === 'true') {
      filters.hasAttachment = true;
    } else if (hasAttachment === 'false') {
      filters.hasAttachment = false;
    }

    const chatType = searchParams.get('chatType');
    if (chatType && ['all', 'group', 'individual'].includes(chatType)) {
      filters.chatType = chatType as 'all' | 'group' | 'individual';
    }

    // Perform search
    const { results, total, hasMore } = searchMessages(query, filters, limit, offset);

    const response: SearchResponse = {
      results,
      hasMore,
      total,
      query,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error searching messages:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to search messages',
      },
      { status: 500 }
    );
  }
}
