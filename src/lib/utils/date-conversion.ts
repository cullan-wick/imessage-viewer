import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

/**
 * Apple epoch starts at 2001-01-01 00:00:00 UTC
 * chat.db stores dates as nanoseconds since Apple epoch
 * Convert to JavaScript Date (milliseconds since Unix epoch: 1970-01-01)
 */
const APPLE_EPOCH_OFFSET = 978307200; // seconds between Unix epoch and Apple epoch

export function appleEpochToDate(appleTimestamp: number): Date {
  // Convert nanoseconds to seconds, add offset, convert to milliseconds
  const unixTimestamp = (appleTimestamp / 1_000_000_000 + APPLE_EPOCH_OFFSET) * 1000;
  return new Date(unixTimestamp);
}

export function dateToAppleEpoch(date: Date): number {
  // Convert to Unix seconds, subtract offset, convert to nanoseconds
  const unixSeconds = date.getTime() / 1000;
  return (unixSeconds - APPLE_EPOCH_OFFSET) * 1_000_000_000;
}

/**
 * Format date for display in conversation list
 * - "Just now" if within last minute
 * - "5m", "2h" for recent messages
 * - "Yesterday" for yesterday
 * - "Mon" for this week
 * - "Jan 15" for this year
 * - "1/15/24" for older
 */
export function formatConversationDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m`;
  }
  if (diffHours < 24 && isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  if (isThisWeek(date, { weekStartsOn: 0 })) {
    return format(date, 'EEE'); // Mon, Tue, etc.
  }
  if (isThisYear(date)) {
    return format(date, 'MMM d'); // Jan 15
  }
  return format(date, 'M/d/yy'); // 1/15/24
}

/**
 * Format date for message timestamps
 * "Today at 2:30 PM", "Yesterday at 10:15 AM", "Jan 15 at 3:45 PM"
 */
export function formatMessageTimestamp(date: Date): string {
  const timeStr = format(date, 'h:mm a');

  if (isToday(date)) {
    return `Today at ${timeStr}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${timeStr}`;
  }
  if (isThisYear(date)) {
    return format(date, `MMM d 'at' h:mm a`);
  }
  return format(date, `M/d/yy 'at' h:mm a`);
}

/**
 * Format date for sticky date dividers in chat view
 * "Monday, January 15, 2024"
 */
export function formatDateDivider(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'EEEE, MMMM d, yyyy');
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Group messages by day
 * Returns a Map of date strings to messages
 */
export function groupMessagesByDay<T extends { date: Date }>(messages: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const message of messages) {
    const dayKey = format(message.date, 'yyyy-MM-dd');
    const existing = groups.get(dayKey) || [];
    existing.push(message);
    groups.set(dayKey, existing);
  }

  return groups;
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
}

/**
 * Format date for SQL queries (ISO format)
 */
export function formatForSQL(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO date string from API
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}
