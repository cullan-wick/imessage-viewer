import { NextRequest, NextResponse } from 'next/server';
import { getMessages } from '@/lib/db/queries';
import type { MessagesResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messages/[chatId]
 * Fetch messages for a specific conversation
 *
 * Query params:
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 * - before: string (ISO date) - fetch messages before this date
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const chatIdNum = parseInt(chatId, 10);

    if (isNaN(chatIdNum)) {
      return NextResponse.json(
        { error: 'Invalid chat ID', message: 'Chat ID must be a number' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const beforeParam = searchParams.get('before');

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

    // Parse before date if provided
    let beforeDate: Date | undefined;
    if (beforeParam) {
      beforeDate = new Date(beforeParam);
      if (isNaN(beforeDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date', message: 'Before parameter must be a valid ISO date string' },
          { status: 400 }
        );
      }
    }

    // Fetch messages
    const { messages, hasMore } = getMessages(chatIdNum, limit, offset, beforeDate);

    const response: MessagesResponse = {
      messages,
      hasMore,
      chatId: chatIdNum,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching messages:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch messages',
      },
      { status: 500 }
    );
  }
}
