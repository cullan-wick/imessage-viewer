import { NextRequest, NextResponse } from 'next/server';
import { getMediaForChat } from '@/lib/db/queries';
import type { MediaResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/media/[chatId]
 * Fetch all media attachments for a conversation
 *
 * Query params:
 * - type: 'image' | 'video' | 'all' (default: 'all')
 * - limit: number (default: 100)
 * - offset: number (default: 0)
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

    const typeParam = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate parameters
    if (!['image', 'video', 'all'].includes(typeParam)) {
      return NextResponse.json(
        { error: 'Invalid type', message: 'Type must be "image", "video", or "all"' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 200) {
      return NextResponse.json(
        { error: 'Invalid limit', message: 'Limit must be between 1 and 200' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset', message: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    const mediaType = typeParam as 'image' | 'video' | 'all';

    // Fetch media
    const { media, hasMore } = getMediaForChat(chatIdNum, mediaType, limit, offset);

    // Count total media (could be optimized with a separate count query)
    const { media: allMedia } = getMediaForChat(chatIdNum, mediaType, 10000, 0);
    const total = allMedia.length;

    const response: MediaResponse = {
      media,
      hasMore,
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error fetching media:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch media',
      },
      { status: 500 }
    );
  }
}
