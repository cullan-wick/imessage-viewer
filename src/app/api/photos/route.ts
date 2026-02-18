import { NextRequest, NextResponse } from "next/server";
import { getAllPhotos, getPhotoCount } from "@/lib/db/queries";
import type { AllPhotosResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/photos
 * Fetch all photos with optional filtering
 *
 * Query params:
 * - contact?: string - filter by contact identifier
 * - type?: 'image' | 'video' | 'all' (default: 'all')
 * - yearMonth?: string - filter by year-month (e.g., "2024-01")
 * - limit?: number (default: 100)
 * - offset?: number (default: 0)
 * - order?: 'asc' | 'desc' (default: 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const contact = searchParams.get("contact") || undefined;
    const typeParam = searchParams.get("type") || "all";
    const yearMonth = searchParams.get("yearMonth") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const orderParam = searchParams.get("order") || "desc";

    // Validate parameters
    if (!["image", "video", "all"].includes(typeParam)) {
      return NextResponse.json(
        {
          error: "Invalid type",
          message: 'Type must be "image", "video", or "all"',
        },
        { status: 400 },
      );
    }

    if (limit < 1 || limit > 200) {
      return NextResponse.json(
        { error: "Invalid limit", message: "Limit must be between 1 and 200" },
        { status: 400 },
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: "Invalid offset", message: "Offset must be non-negative" },
        { status: 400 },
      );
    }

    if (!["asc", "desc"].includes(orderParam)) {
      return NextResponse.json(
        { error: "Invalid order", message: 'Order must be "asc" or "desc"' },
        { status: 400 },
      );
    }

    const type = typeParam as "image" | "video" | "all";
    const order = orderParam as "asc" | "desc";

    // Fetch photos
    const { photos, hasMore } = getAllPhotos({
      contact,
      type,
      yearMonth,
      limit,
      offset,
      order,
    });

    const total = getPhotoCount({ contact, type, yearMonth });

    const response: AllPhotosResponse = {
      photos,
      hasMore,
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] Error fetching photos:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to fetch photos",
      },
      { status: 500 },
    );
  }
}
