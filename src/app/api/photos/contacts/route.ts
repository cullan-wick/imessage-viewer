import { NextResponse } from "next/server";
import { getPhotoContacts } from "@/lib/db/queries";
import type { PhotoContactsResponse } from "@/types/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/photos/contacts
 * Fetch contacts who have photos, with counts
 */
export async function GET() {
  try {
    const contacts = getPhotoContacts();

    const response: PhotoContactsResponse = {
      contacts,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] Error fetching photo contacts:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch photo contacts",
      },
      { status: 500 },
    );
  }
}
