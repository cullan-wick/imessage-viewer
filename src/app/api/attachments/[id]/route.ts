import { NextRequest, NextResponse } from 'next/server';
import { getAttachment } from '@/lib/db/queries';
import { resolveAttachmentPath } from '@/lib/utils/attachment-path';
import { promises as fs } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * GET /api/attachments/[id]
 * Serve attachment file with proper Content-Type
 * Supports range requests for video streaming
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attachmentId = parseInt(id, 10);

    if (isNaN(attachmentId)) {
      return NextResponse.json(
        { error: 'Invalid attachment ID', message: 'Attachment ID must be a number' },
        { status: 400 }
      );
    }

    // Fetch attachment metadata from database
    const attachment = getAttachment(attachmentId);

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found', message: `Attachment ${attachmentId} does not exist` },
        { status: 404 }
      );
    }

    // Resolve file path
    const filePath = resolveAttachmentPath(attachment.filename);

    console.log(`[Attachment ${attachmentId}] DB filename: ${attachment.filename}`);
    console.log(`[Attachment ${attachmentId}] Resolved path: ${filePath}`);

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path not found', message: 'Attachment file path could not be resolved' },
        { status: 404 }
      );
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      console.log(`[Attachment ${attachmentId}] File NOT found at: ${filePath}`);
      return NextResponse.json(
        { error: 'File not found', message: `File does not exist at ${filePath}` },
        { status: 404 }
      );
    }

    // Get file stats
    const fileStats = await stat(filePath);
    const fileSize = fileStats.size;

    // Determine Content-Type
    const contentType =
      attachment.mimeType || getMimeType(path.extname(filePath)) || 'application/octet-stream';

    // Handle range requests (important for video streaming)
    const rangeHeader = request.headers.get('range');

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      // Read file chunk
      const fileHandle = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(chunksize);
      await fileHandle.read(buffer, 0, chunksize, start);
      await fileHandle.close();

      return new NextResponse(buffer, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    }

    // No range request - serve entire file
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('[API] Error serving attachment:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to serve attachment',
      },
      { status: 500 }
    );
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(ext: string): string | null {
  const mimeTypes: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',

    // Videos
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.m4v': 'video/x-m4v',

    // Audio
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.aac': 'audio/aac',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',

    // Documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',

    // Archives
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
  };

  return mimeTypes[ext.toLowerCase()] || null;
}
