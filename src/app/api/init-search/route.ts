import { NextResponse } from 'next/server';
import { buildSearchIndex, isSearchIndexBuilt } from '@/lib/db/search-index';
import type { InitSearchResponse } from '@/types/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout for building index

/**
 * POST /api/init-search
 * Build the FTS5 search index
 *
 * This is a long-running operation that indexes all messages
 * Should only be called once on first setup, or to rebuild the index
 */
export async function POST() {
  try {
    // Check if index already exists
    if (isSearchIndexBuilt()) {
      return NextResponse.json({
        status: 'completed',
        messagesIndexed: 0,
        duration: 0,
        message: 'Search index already exists. Delete search_index.db to rebuild.',
      });
    }

    const startTime = Date.now();

    // Build the index
    const messagesIndexed = await buildSearchIndex();

    const duration = Date.now() - startTime;

    const response: InitSearchResponse = {
      status: 'completed',
      messagesIndexed,
      duration,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Error building search index:', error);

    const response: InitSearchResponse = {
      status: 'error',
      messagesIndexed: 0,
      duration: 0,
      error: error instanceof Error ? error.message : 'Failed to build search index',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * GET /api/init-search
 * Check if search index is built
 */
export async function GET() {
  try {
    const isBuilt = isSearchIndexBuilt();

    return NextResponse.json({
      isBuilt,
      message: isBuilt
        ? 'Search index is ready'
        : 'Search index needs to be built. Call POST /api/init-search to build it.',
    });
  } catch (error) {
    console.error('[API] Error checking search index:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to check search index status',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/init-search
 * Delete the search index (to force rebuild)
 */
export async function DELETE() {
  try {
    const { getSearchDb } = await import('@/lib/db/connection');
    const db = getSearchDb();

    // Drop the FTS5 table
    db.exec(`DROP TABLE IF EXISTS messages_fts`);

    return NextResponse.json({
      message: 'Search index deleted successfully. Call POST to rebuild.',
    });
  } catch (error) {
    console.error('[API] Error deleting search index:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to delete search index',
      },
      { status: 500 }
    );
  }
}
