import path from 'path';

/**
 * Resolve attachment file paths
 * Attachments are stored in ~/Library/Messages/Attachments/
 * The filename in the database is usually prefixed with "~/"
 */
export function resolveAttachmentPath(dbFilename: string | null): string | null {
  if (!dbFilename) {
    return null;
  }

  const attachmentsBasePath = process.env.ATTACHMENTS_PATH || '';

  // Remove "~/" prefix if present
  let cleanPath = dbFilename;
  if (cleanPath.startsWith('~/')) {
    cleanPath = cleanPath.substring(2);
  }

  // Remove the standard iMessage path prefix if present
  // The database stores paths like ~/Library/Messages/Attachments/xx/yy/file.jpg
  // But in a backup, they're just in Attachments/xx/yy/file.jpg
  const messagePrefixes = [
    'Library/Messages/Attachments/',
    'Library/Messages/Attachments',
  ];

  for (const prefix of messagePrefixes) {
    if (cleanPath.startsWith(prefix)) {
      cleanPath = cleanPath.substring(prefix.length);
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }
      break;
    }
  }

  // If the path is absolute, use it as-is
  if (path.isAbsolute(cleanPath)) {
    return cleanPath;
  }

  // Otherwise, join with base attachments path
  return path.join(attachmentsBasePath, cleanPath);
}

/**
 * Extract filename from full path
 */
export function getFilenameFromPath(filepath: string | null): string | null {
  if (!filepath) {
    return null;
  }
  return path.basename(filepath);
}

/**
 * Get file extension
 */
export function getFileExtension(filepath: string | null): string | null {
  if (!filepath) {
    return null;
  }
  const ext = path.extname(filepath);
  return ext ? ext.substring(1).toLowerCase() : null;
}

/**
 * Determine if file is an image based on mime type or extension
 */
export function isImageFile(mimeType: string | null, filename: string | null): boolean {
  if (mimeType?.startsWith('image/')) {
    return true;
  }

  const ext = getFileExtension(filename);
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'svg'];
  return ext ? imageExts.includes(ext) : false;
}

/**
 * Determine if file is a video based on mime type or extension
 */
export function isVideoFile(mimeType: string | null, filename: string | null): boolean {
  if (mimeType?.startsWith('video/')) {
    return true;
  }

  const ext = getFileExtension(filename);
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'm4v'];
  return ext ? videoExts.includes(ext) : false;
}

/**
 * Determine if file is audio based on mime type or extension
 */
export function isAudioFile(mimeType: string | null, filename: string | null): boolean {
  if (mimeType?.startsWith('audio/')) {
    return true;
  }

  const ext = getFileExtension(filename);
  const audioExts = ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac', 'wma'];
  return ext ? audioExts.includes(ext) : false;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
