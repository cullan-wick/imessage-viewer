import { NextRequest, NextResponse } from 'next/server';
import { getConversations, getConversationCount } from '@/lib/db/queries';
import type { ConversationsResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/conversations
 * List all conversations with pagination
 *
 * Query params:
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 * - search: string (optional) - filter by name or identifier
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || undefined;

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

    // Fetch conversations
    const conversations = getConversations(limit, offset, search);

    // Get total count for pagination
    const total = getConversationCount();

    const response: ConversationsResponse = {
      conversations,
      hasMore: offset + conversations.length < total,
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching conversations:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch conversations',
      },
      { status: 500 }
    );
  }
}
