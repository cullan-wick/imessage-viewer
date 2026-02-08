import fs from 'fs';
import path from 'path';

let contactsCache: Record<string, string> | null = null;

/**
 * Load contacts from contacts.json file
 */
export function loadContacts(): Record<string, string> {
  if (contactsCache) {
    return contactsCache;
  }

  try {
    const contactsPath = path.join(process.cwd(), 'contacts.json');

    if (!fs.existsSync(contactsPath)) {
      console.log('[Contacts] contacts.json not found, using phone numbers as display names');
      contactsCache = {};
      return contactsCache;
    }

    const fileContent = fs.readFileSync(contactsPath, 'utf-8');
    const data = JSON.parse(fileContent);
    contactsCache = data.contacts || {};

    console.log(`[Contacts] Loaded ${Object.keys(contactsCache).length} contact mappings`);
    return contactsCache;
  } catch (error) {
    console.error('[Contacts] Error loading contacts.json:', error);
    contactsCache = {};
    return contactsCache;
  }
}

/**
 * Get display name for a contact ID (phone number or email)
 * Returns the contact name if found, otherwise returns the formatted ID
 */
export function getContactName(contactId: string | null): string | null {
  if (!contactId) {
    return null;
  }

  const contacts = loadContacts();

  // Try exact match first
  if (contacts[contactId]) {
    return contacts[contactId];
  }

  // Try normalized phone number (remove spaces, dashes, etc.)
  const normalized = contactId.replace(/[\s\-\(\)]/g, '');
  if (contacts[normalized]) {
    return contacts[normalized];
  }

  // Try with +1 prefix
  if (!normalized.startsWith('+') && normalized.length === 10) {
    const withCountryCode = '+1' + normalized;
    if (contacts[withCountryCode]) {
      return contacts[withCountryCode];
    }
  }

  // Not found - return null so caller can use formatted ID
  return null;
}
