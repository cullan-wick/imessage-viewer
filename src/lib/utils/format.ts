/**
 * Formatting utilities for display
 */

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format phone number for display
 * Handles various formats: +1234567890, 1234567890, (123) 456-7890
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Return original if format is unknown
  return phone;
}

/**
 * Format email for display (lowercase)
 */
export function formatEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Get display name from contact identifier
 * Tries to format phone numbers, emails, or returns as-is
 */
export function formatContactIdentifier(identifier: string): string {
  // Check if it's a phone number (contains only digits and formatting characters)
  if (/^[\d\s\-\(\)\+]+$/.test(identifier)) {
    return formatPhoneNumber(identifier);
  }

  // Check if it's an email
  if (identifier.includes('@')) {
    return formatEmail(identifier);
  }

  // Return as-is
  return identifier;
}

/**
 * Extract initials from a name
 */
export function getInitials(name: string | null): string {
  if (!name) return '?';

  // For phone numbers, use last 4 digits
  if (/^[\d\s\-\(\)\+]+$/.test(name)) {
    const digits = name.replace(/\D/g, '');
    return digits.slice(-4) || '??';
  }

  // For emails, use first letter of username
  if (name.includes('@')) {
    const username = name.split('@')[0];
    return username.substring(0, 2).toUpperCase();
  }

  // For names
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent color for a contact based on their identifier
 * Returns a Tailwind color class
 */
export function getContactColor(identifier: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Format message text preview (remove newlines, truncate)
 */
export function formatMessagePreview(text: string | null): string {
  if (!text) return 'No message text';

  // Remove newlines and excessive whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim();

  return truncate(cleaned, 100);
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || singular + 's';
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Highlight search terms in text
 * Returns HTML string with <mark> tags
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
