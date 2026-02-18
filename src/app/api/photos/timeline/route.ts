import { NextRequest, NextResponse } from "next/server";
import { getPhotoTimeline } from "@/lib/db/queries";
import type { PhotoTimelineResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/photos/timeline
 * Fetch photo counts grouped by year-month for timeline
 *
 * Query params:
 * - contact?: string - filter by contact identifier
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contact = searchParams.get("contact") || undefined;

    const { buckets, totalPhotos } = getPhotoTimeline(contact);

    const response: PhotoTimelineResponse = {
      buckets,
      totalPhotos,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] Error fetching photo timeline:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch photo timeline",
      },
      { status: 500 },
    );
  }
}
