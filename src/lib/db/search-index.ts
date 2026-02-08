import type { SearchResult, SearchFilters, Message, Conversation } from '@/types/database';
import { getChatDb, getSearchDb } from './connection';
import { appleEpochToDate, dateToAppleEpoch } from '../utils/date-conversion';
import { getConversation } from './queries';

/**
 * Check if the search index exists and is populated
 */
export function isSearchIndexBuilt(): boolean {
  try {
    const db = getSearchDb();

    // Check if the FTS5 table exists
    const tableCheck = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='messages_fts'`
      )
      .get() as any;

    if (!tableCheck) {
      return false;
    }

    // Check if it has any rows
    const countCheck = db.prepare(`SELECT COUNT(*) as count FROM messages_fts`).get() as any;

    return countCheck.count > 0;
  } catch (error) {
    console.error('[Search Index] Error checking if index is built:', error);
    return false;
  }
}

/**
 * Build the FTS5 search index
 * This is a one-time operation (or can be re-run to rebuild)
 * Returns the number of messages indexed
 */
export async function buildSearchIndex(
  onProgress?: (current: number, total: number) => void
): Promise<number> {
  const chatDb = getChatDb();
  const searchDb = getSearchDb();

  console.log('[Search Index] Starting to build FTS5 search index...');

  // Drop existing table if it exists
  searchDb.exec(`DROP TABLE IF EXISTS messages_fts`);

  // Create FTS5 virtual table
  // Using porter tokenizer for better English word stemming
  // unicode61 removes diacritics for better matching
  searchDb.exec(`
    CREATE VIRTUAL TABLE messages_fts USING fts5(
      message_id UNINDEXED,
      guid UNINDEXED,
      text,
      chat_id UNINDEXED,
      handle_id UNINDEXED,
      date UNINDEXED,
      is_from_me UNINDEXED,
      has_attachments UNINDEXED,
      tokenize='porter unicode61'
    )
  `);

  // Get total message count for progress reporting
  const totalResult = chatDb.prepare(`SELECT COUNT(*) as count FROM message`).get() as any;
  const totalMessages = totalResult.count;

  console.log(`[Search Index] Indexing ${totalMessages} messages...`);

  // Fetch all messages in batches
  const batchSize = 1000;
  let offset = 0;
  let indexed = 0;

  const insertStmt = searchDb.prepare(`
    INSERT INTO messages_fts (message_id, guid, text, chat_id, handle_id, date, is_from_me, has_attachments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  while (offset < totalMessages) {
    const messages = chatDb
      .prepare(
        `
      SELECT
        m.ROWID as message_id,
        m.guid,
        m.text,
        cmj.chat_id,
        m.handle_id,
        m.date,
        m.is_from_me,
        m.cache_has_attachments
      FROM message m
      LEFT JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
      WHERE m.text IS NOT NULL AND m.text != ''
      ORDER BY m.ROWID
      LIMIT ? OFFSET ?
    `
      )
      .all(batchSize, offset) as any[];

    if (messages.length === 0) {
      break;
    }

    // Insert batch
    const insertMany = searchDb.transaction((msgs: any[]) => {
      for (const msg of msgs) {
        insertStmt.run(
          msg.message_id,
          msg.guid,
          msg.text,
          msg.chat_id,
          msg.handle_id,
          msg.date,
          msg.is_from_me,
          msg.cache_has_attachments
        );
      }
    });

    insertMany(messages);

    indexed += messages.length;
    offset += batchSize;

    if (onProgress) {
      onProgress(indexed, totalMessages);
    }

    // Log progress
    if (indexed % 10000 === 0) {
      console.log(`[Search Index] Indexed ${indexed}/${totalMessages} messages`);
    }
  }

  console.log(`[Search Index] Successfully indexed ${indexed} messages`);

  // Optimize the FTS5 table for better query performance
  searchDb.exec(`INSERT INTO messages_fts(messages_fts) VALUES('optimize')`);

  return indexed;
}

/**
 * Search messages using FTS5
 */
export function searchMessages(
  query: string,
  filters?: SearchFilters,
  limit: number = 50,
  offset: number = 0
): { results: SearchResult[]; total: number; hasMore: boolean } {
  const searchDb = getSearchDb();
  const chatDb = getChatDb();

  if (!isSearchIndexBuilt()) {
    throw new Error('Search index has not been built yet. Please build the index first.');
  }

  // Build FTS5 query
  // Escape special characters and prepare for FTS5 syntax
  const ftsQuery = prepareFTS5Query(query);

  let sql = `
    SELECT
      message_id,
      guid,
      chat_id,
      handle_id,
      date,
      is_from_me,
      has_attachments,
      snippet(messages_fts, 2, '<mark>', '</mark>', '...', 64) as snippet,
      rank
    FROM messages_fts
    WHERE messages_fts MATCH ?
  `;

  const params: any[] = [ftsQuery];

  // Apply filters
  if (filters?.dateFrom) {
    const appleTimestamp = dateToAppleEpoch(filters.dateFrom);
    sql += ` AND date >= ?`;
    params.push(appleTimestamp);
  }

  if (filters?.dateTo) {
    const appleTimestamp = dateToAppleEpoch(filters.dateTo);
    sql += ` AND date <= ?`;
    params.push(appleTimestamp);
  }

  if (filters?.direction === 'sent') {
    sql += ` AND is_from_me = 1`;
  } else if (filters?.direction === 'received') {
    sql += ` AND is_from_me = 0`;
  }

  if (filters?.hasAttachment !== undefined) {
    sql += ` AND has_attachments = ?`;
    params.push(filters.hasAttachment ? 1 : 0);
  }

  if (filters?.personIds && filters.personIds.length > 0) {
    const placeholders = filters.personIds.map(() => '?').join(',');
    sql += ` AND handle_id IN (${placeholders})`;
    params.push(...filters.personIds);
  }

  // Get total count before pagination
  const countSql = `SELECT COUNT(*) as count FROM (${sql})`;
  const totalResult = searchDb.prepare(countSql).get(...params) as any;
  const total = totalResult.count;

  // Add ordering and pagination
  sql += ` ORDER BY rank LIMIT ? OFFSET ?`;
  params.push(limit + 1, offset); // Fetch one extra to check hasMore

  const searchResults = searchDb.prepare(sql).all(...params) as any[];

  const hasMore = searchResults.length > limit;
  const resultRows = hasMore ? searchResults.slice(0, limit) : searchResults;

  // For each result, fetch full message details and conversation info
  const results: SearchResult[] = resultRows.map((row) => {
    // Get full message from chat.db
    const messageQuery = `
      SELECT
        m.ROWID as id,
        m.guid,
        m.text,
        m.date,
        m.is_from_me,
        m.is_read,
        m.is_sent,
        m.cache_has_attachments,
        m.associated_message_guid,
        m.expressive_send_style_id,
        h.id as sender_id
      FROM message m
      LEFT JOIN handle h ON m.handle_id = h.ROWID
      WHERE m.ROWID = ?
    `;

    const messageRow = chatDb.prepare(messageQuery).get(row.message_id) as any;

    const message: Message = {
      id: messageRow.id,
      guid: messageRow.guid,
      text: messageRow.text,
      date: appleEpochToDate(messageRow.date),
      isFromMe: messageRow.is_from_me === 1,
      senderId: messageRow.sender_id,
      senderName: null,
      hasAttachments: messageRow.cache_has_attachments === 1,
      isRead: messageRow.is_read === 1,
      isSent: messageRow.is_sent === 1,
      associatedMessageGuid: messageRow.associated_message_guid,
      expressiveSendStyleId: messageRow.expressive_send_style_id,
    };

    // Get conversation info
    const conversation = getConversation(row.chat_id);

    if (!conversation) {
      throw new Error(`Conversation ${row.chat_id} not found`);
    }

    // Get context messages (before and after)
    const contextBefore = getContextMessages(row.chat_id, row.message_id, 'before', 2);
    const contextAfter = getContextMessages(row.chat_id, row.message_id, 'after', 2);

    return {
      message,
      conversation,
      snippet: row.snippet,
      contextBefore,
      contextAfter,
      matchCount: 1, // Could enhance to count matches in snippet
    };
  });

  return { results, total, hasMore };
}

/**
 * Get context messages around a specific message
 */
function getContextMessages(
  chatId: number,
  messageId: number,
  direction: 'before' | 'after',
  count: number
): Message[] {
  const chatDb = getChatDb();

  const query = `
    SELECT
      m.ROWID as id,
      m.guid,
      m.text,
      m.date,
      m.is_from_me,
      m.is_read,
      m.is_sent,
      m.cache_has_attachments,
      m.associated_message_guid,
      m.expressive_send_style_id,
      h.id as sender_id
    FROM message m
    JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
    LEFT JOIN handle h ON m.handle_id = h.ROWID
    WHERE cmj.chat_id = ? AND m.ROWID ${direction === 'before' ? '<' : '>'} ?
    ORDER BY m.date ${direction === 'before' ? 'DESC' : 'ASC'}
    LIMIT ?
  `;

  const rows = chatDb.prepare(query).all(chatId, messageId, count) as any[];

  const messages = rows.map((row) => ({
    id: row.id,
    guid: row.guid,
    text: row.text,
    date: appleEpochToDate(row.date),
    isFromMe: row.is_from_me === 1,
    senderId: row.sender_id,
    senderName: null,
    hasAttachments: row.cache_has_attachments === 1,
    isRead: row.is_read === 1,
    isSent: row.is_sent === 1,
    associatedMessageGuid: row.associated_message_guid,
    expressiveSendStyleId: row.expressive_send_style_id,
  }));

  // Reverse before messages to maintain chronological order
  return direction === 'before' ? messages.reverse() : messages;
}

/**
 * Prepare query string for FTS5 syntax
 * Handles phrase queries, AND/OR operators, and escaping
 */
function prepareFTS5Query(query: string): string {
  // Trim whitespace
  query = query.trim();

  // If empty, return match-all
  if (!query) {
    return '*';
  }

  // If it's a phrase query (in quotes), return as-is
  if (query.startsWith('"') && query.endsWith('"')) {
    return query;
  }

  // Escape special FTS5 characters: " ( ) * [ ] { } : ^
  // But preserve AND, OR, NOT operators
  const words = query.split(/\s+/);

  const processedWords = words.map((word) => {
    // Keep operators as-is
    if (['AND', 'OR', 'NOT'].includes(word.toUpperCase())) {
      return word.toUpperCase();
    }

    // Escape special characters
    const escaped = word.replace(/["()*[\]{}:^]/g, '');

    // Add prefix matching with * for partial word matches
    return escaped ? `${escaped}*` : '';
  });

  return processedWords.filter((w) => w).join(' ');
}

/**
 * Get search suggestions based on partial query
 * Returns common words/phrases that match
 */
export function getSearchSuggestions(partialQuery: string, limit: number = 10): string[] {
  // This is a simple implementation
  // Could be enhanced with a dedicated suggestions table or caching
  const searchDb = getSearchDb();

  if (!isSearchIndexBuilt() || partialQuery.length < 2) {
    return [];
  }

  try {
    const query = `${partialQuery}*`;

    const sql = `
      SELECT DISTINCT text
      FROM messages_fts
      WHERE messages_fts MATCH ?
      LIMIT ?
    `;

    const results = searchDb.prepare(sql).all(query, limit) as any[];

    // Extract first few words from each result
    return results
      .map((row) => {
        const words = row.text.split(/\s+/);
        return words.slice(0, 5).join(' ');
      })
      .slice(0, limit);
  } catch (error) {
    console.error('[Search Index] Error getting suggestions:', error);
    return [];
  }
}
