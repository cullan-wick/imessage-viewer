import type {
  Conversation,
  Message,
  Participant,
  Attachment,
  Statistics,
  SearchFilters,
  TopContactsPeriod,
  TopContact,
} from '@/types/database';
import { getChatDb } from './connection';
import { appleEpochToDate, dateToAppleEpoch } from '../utils/date-conversion';
import { getContactName } from '../utils/contacts';
import { extractTextFromAttributedBody } from '../utils/typedstream';

/**
 * Get all conversations with pagination
 * Sorted by most recent message date
 */
export function getConversations(
  limit: number = 50,
  offset: number = 0,
  searchTerm?: string
): Conversation[] {
  const db = getChatDb();

  let query = `
    SELECT
      c.ROWID as id,
      c.chat_identifier,
      c.display_name,
      c.style,
      MAX(m.date) as last_message_date,
      (
        SELECT m2.text
        FROM message m2
        JOIN chat_message_join cmj2 ON m2.ROWID = cmj2.message_id
        WHERE cmj2.chat_id = c.ROWID
        ORDER BY m2.date DESC
        LIMIT 1
      ) as last_message_text,
      (
        SELECT m2.attributedBody
        FROM message m2
        JOIN chat_message_join cmj2 ON m2.ROWID = cmj2.message_id
        WHERE cmj2.chat_id = c.ROWID
        ORDER BY m2.date DESC
        LIMIT 1
      ) as last_message_attributed_body,
      (
        SELECT m2.is_from_me
        FROM message m2
        JOIN chat_message_join cmj2 ON m2.ROWID = cmj2.message_id
        WHERE cmj2.chat_id = c.ROWID
        ORDER BY m2.date DESC
        LIMIT 1
      ) as last_message_is_from_me,
      COUNT(DISTINCT m.ROWID) as message_count
    FROM chat c
    LEFT JOIN chat_message_join cmj ON c.ROWID = cmj.chat_id
    LEFT JOIN message m ON cmj.message_id = m.ROWID
  `;

  const params: any[] = [];

  if (searchTerm) {
    query += `
      WHERE c.display_name LIKE ? OR c.chat_identifier LIKE ?
    `;
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern);
  }

  query += `
    GROUP BY c.ROWID
    HAVING message_count > 0
    ORDER BY last_message_date DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as any[];

  return rows.map((row) => {
    const participants = getParticipantsForChat(row.id);
    const lastMessageText = row.last_message_text
      || extractTextFromAttributedBody(row.last_message_attributed_body)
      || null;

    return {
      id: row.id,
      chatIdentifier: row.chat_identifier,
      displayName: row.display_name || deriveDisplayName(row.chat_identifier, participants),
      isGroup: row.style === 43, // 43 = group chat
      lastMessageDate: row.last_message_date ? appleEpochToDate(row.last_message_date) : null,
      lastMessageText,
      lastMessageIsFromMe: row.last_message_is_from_me === 1,
      messageCount: row.message_count,
      participants,
    };
  });
}

/**
 * Get participants for a specific chat
 */
export function getParticipantsForChat(chatId: number): Participant[] {
  const db = getChatDb();

  const query = `
    SELECT DISTINCT
      h.ROWID as id,
      h.id as contact_id,
      h.service
    FROM handle h
    JOIN chat_handle_join chj ON h.ROWID = chj.handle_id
    WHERE chj.chat_id = ?
  `;

  const stmt = db.prepare(query);
  const rows = stmt.all(chatId) as any[];

  return rows.map((row) => ({
    id: row.id,
    contactId: row.contact_id,
    displayName: getContactName(row.contact_id),
    service: row.service,
  }));
}

/**
 * Derive a display name from chat identifier and participants
 */
function deriveDisplayName(chatIdentifier: string, participants: Participant[]): string {
  if (participants.length === 1) {
    return participants[0].displayName || participants[0].contactId;
  }

  if (participants.length > 1) {
    return participants.map(p => p.displayName || p.contactId.split('@')[0]).join(', ');
  }

  return chatIdentifier;
}

/**
 * Get messages for a specific chat with pagination
 */
export function getMessages(
  chatId: number,
  limit: number = 50,
  offset: number = 0,
  beforeDate?: Date
): { messages: Message[]; hasMore: boolean } {
  const db = getChatDb();

  let query = `
    SELECT
      m.ROWID as id,
      m.guid,
      m.text,
      m.attributedBody,
      m.date,
      m.is_from_me,
      m.is_read,
      m.is_sent,
      m.cache_has_attachments,
      m.associated_message_guid,
      m.expressive_send_style_id,
      h.id as sender_id,
      h.ROWID as handle_id
    FROM message m
    JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
    LEFT JOIN handle h ON m.handle_id = h.ROWID
    WHERE cmj.chat_id = ?
  `;

  const params: any[] = [chatId];

  if (beforeDate) {
    // Convert JS Date to Apple epoch for comparison
    const appleTimestamp = (beforeDate.getTime() / 1000 - 978307200) * 1_000_000_000;
    query += ` AND m.date < ?`;
    params.push(appleTimestamp);
  }

  query += `
    ORDER BY m.date DESC
    LIMIT ?
  `;

  // Fetch one extra to check if there are more messages
  params.push(limit + 1);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as any[];

  const hasMore = rows.length > limit;
  const messageRows = hasMore ? rows.slice(0, limit) : rows;

  const messages = messageRows.map((row) => {
    // Use text column first, fall back to extracting from attributedBody blob
    const text = row.text || extractTextFromAttributedBody(row.attributedBody) || null;

    const message: Message = {
      id: row.id,
      guid: row.guid,
      text,
      date: appleEpochToDate(row.date),
      isFromMe: row.is_from_me === 1,
      senderId: row.sender_id,
      senderName: getContactName(row.sender_id),
      hasAttachments: row.cache_has_attachments === 1,
      isRead: row.is_read === 1,
      isSent: row.is_sent === 1,
      associatedMessageGuid: row.associated_message_guid,
      expressiveSendStyleId: row.expressive_send_style_id,
    };

    // Fetch attachments if present
    if (message.hasAttachments) {
      message.attachments = getAttachmentsForMessage(row.id);
    }

    return message;
  });

  return { messages, hasMore };
}

/**
 * Get attachments for a specific message
 */
export function getAttachmentsForMessage(messageId: number): Attachment[] {
  const db = getChatDb();

  const query = `
    SELECT
      a.ROWID as id,
      a.guid,
      a.filename,
      a.mime_type,
      a.transfer_name,
      a.total_bytes,
      a.is_sticker
    FROM attachment a
    JOIN message_attachment_join maj ON a.ROWID = maj.attachment_id
    WHERE maj.message_id = ?
  `;

  const stmt = db.prepare(query);
  const rows = stmt.all(messageId) as any[];

  return rows.map((row) => ({
    id: row.id,
    guid: row.guid,
    filename: row.filename,
    mimeType: row.mime_type,
    transferName: row.transfer_name,
    totalBytes: row.total_bytes,
    isSticker: row.is_sticker === 1,
    messageId,
  }));
}

/**
 * Get a specific attachment by ID
 */
export function getAttachment(attachmentId: number): Attachment | null {
  const db = getChatDb();

  const query = `
    SELECT
      ROWID as id,
      guid,
      filename,
      mime_type,
      transfer_name,
      total_bytes,
      is_sticker
    FROM attachment
    WHERE ROWID = ?
  `;

  const stmt = db.prepare(query);
  const row = stmt.get(attachmentId) as any;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    guid: row.guid,
    filename: row.filename,
    mimeType: row.mime_type,
    transferName: row.transfer_name,
    totalBytes: row.total_bytes,
    isSticker: row.is_sticker === 1,
  };
}

/**
 * Get all media attachments for a specific chat
 */
export function getMediaForChat(
  chatId: number,
  mediaType?: 'image' | 'video' | 'all',
  limit: number = 100,
  offset: number = 0
): { media: Attachment[]; hasMore: boolean } {
  const db = getChatDb();

  let query = `
    SELECT
      a.ROWID as id,
      a.guid,
      a.filename,
      a.mime_type,
      a.transfer_name,
      a.total_bytes,
      a.is_sticker,
      m.ROWID as message_id,
      m.date as message_date
    FROM attachment a
    JOIN message_attachment_join maj ON a.ROWID = maj.attachment_id
    JOIN message m ON maj.message_id = m.ROWID
    JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
    WHERE cmj.chat_id = ?
  `;

  const params: any[] = [chatId];

  // Filter by media type
  if (mediaType === 'image') {
    query += ` AND (a.mime_type LIKE 'image/%' OR a.filename LIKE '%.jpg' OR a.filename LIKE '%.jpeg' OR a.filename LIKE '%.png' OR a.filename LIKE '%.gif' OR a.filename LIKE '%.heic')`;
  } else if (mediaType === 'video') {
    query += ` AND (a.mime_type LIKE 'video/%' OR a.filename LIKE '%.mp4' OR a.filename LIKE '%.mov' OR a.filename LIKE '%.m4v')`;
  } else {
    // 'all' - include both images and videos
    query += ` AND (a.mime_type LIKE 'image/%' OR a.mime_type LIKE 'video/%' OR a.filename LIKE '%.jpg' OR a.filename LIKE '%.jpeg' OR a.filename LIKE '%.png' OR a.filename LIKE '%.gif' OR a.filename LIKE '%.heic' OR a.filename LIKE '%.mp4' OR a.filename LIKE '%.mov')`;
  }

  query += `
    ORDER BY m.date DESC
    LIMIT ?
  `;

  // Fetch one extra to check if there are more
  params.push(limit + 1);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as any[];

  const hasMore = rows.length > limit;
  const mediaRows = hasMore ? rows.slice(0, limit) : rows;

  const media = mediaRows.map((row) => ({
    id: row.id,
    guid: row.guid,
    filename: row.filename,
    mimeType: row.mime_type,
    transferName: row.transfer_name,
    totalBytes: row.total_bytes,
    isSticker: row.is_sticker === 1,
    messageId: row.message_id,
    messageDate: appleEpochToDate(row.message_date),
  }));

  return { media, hasMore };
}

/**
 * Get aggregate statistics
 */
export function getStatistics(): Statistics {
  const db = getChatDb();

  // Overview stats
  const overviewQuery = `
    SELECT
      COUNT(DISTINCT m.ROWID) as total_messages,
      COUNT(DISTINCT c.ROWID) as total_conversations,
      COUNT(DISTINCT a.ROWID) as total_attachments,
      MIN(m.date) as earliest_date,
      MAX(m.date) as latest_date
    FROM message m
    LEFT JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
    LEFT JOIN chat c ON cmj.chat_id = c.ROWID
    LEFT JOIN message_attachment_join maj ON m.ROWID = maj.message_id
    LEFT JOIN attachment a ON maj.attachment_id = a.ROWID
  `;

  const overview = db.prepare(overviewQuery).get() as any;

  // Top contacts by time period
  const getTopContactsForPeriod = (sinceDate?: Date): TopContact[] => {
    let query = `
      SELECT
        h.id as identifier,
        COUNT(m.ROWID) as message_count,
        SUM(CASE WHEN m.is_from_me = 1 THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN m.is_from_me = 0 THEN 1 ELSE 0 END) as received_count
      FROM message m
      LEFT JOIN handle h ON m.handle_id = h.ROWID
      WHERE h.id IS NOT NULL
    `;
    const params: any[] = [];
    if (sinceDate) {
      query += ` AND m.date >= ?`;
      params.push(dateToAppleEpoch(sinceDate));
    }
    query += ` GROUP BY h.id ORDER BY message_count DESC LIMIT 10`;

    const rows = (db.prepare(query).all(...params) as any[]);
    return rows.map((row) => ({
      name: getContactName(row.identifier) || row.identifier,
      identifier: row.identifier,
      messageCount: row.message_count,
      sentCount: row.sent_count,
      receivedCount: row.received_count,
    }));
  };

  const now = new Date();
  const periodCutoffs: Record<TopContactsPeriod, Date | undefined> = {
    '7d': new Date(now.getTime() - 7 * 86_400_000),
    '30d': new Date(now.getTime() - 30 * 86_400_000),
    '6m': new Date(new Date(now).setMonth(now.getMonth() - 6)),
    '1y': new Date(new Date(now).setFullYear(now.getFullYear() - 1)),
    'all': undefined,
  };

  const topContactsByPeriod = {} as Statistics['topContactsByPeriod'];
  for (const [period, cutoff] of Object.entries(periodCutoffs)) {
    topContactsByPeriod[period as TopContactsPeriod] = getTopContactsForPeriod(cutoff);
  }
  const topContacts = topContactsByPeriod['all'];

  // Streak tracking
  const streakQuery = `
    WITH contact_days AS (
      SELECT
        h.id AS identifier,
        DATE(m.date/1000000000 + 978307200, 'unixepoch', 'localtime') AS msg_date
      FROM message m
      JOIN handle h ON m.handle_id = h.ROWID
      WHERE h.id IS NOT NULL
      GROUP BY h.id, msg_date
    ),
    islands AS (
      SELECT
        identifier,
        msg_date,
        DATE(msg_date, '-' || (ROW_NUMBER() OVER (PARTITION BY identifier ORDER BY msg_date) - 1) || ' days') AS island_id
      FROM contact_days
    ),
    streaks AS (
      SELECT
        identifier,
        COUNT(*) AS streak_length,
        MAX(msg_date) AS streak_end
      FROM islands
      GROUP BY identifier, island_id
    ),
    ranked AS (
      SELECT
        identifier,
        MAX(streak_length) AS longest_streak
      FROM streaks
      GROUP BY identifier
      ORDER BY longest_streak DESC
      LIMIT 10
    )
    SELECT
      r.identifier,
      r.longest_streak,
      COALESCE(
        (SELECT s.streak_length FROM streaks s
         WHERE s.identifier = r.identifier
         AND s.streak_end >= DATE('now', 'localtime', '-1 day')
         ORDER BY s.streak_end DESC LIMIT 1),
        0
      ) AS current_streak
    FROM ranked r
    ORDER BY r.longest_streak DESC
  `;

  const streakRows = db.prepare(streakQuery).all() as any[];
  const streaks = streakRows.map((row) => ({
    name: getContactName(row.identifier) || row.identifier,
    identifier: row.identifier,
    longestStreak: row.longest_streak,
    currentStreak: row.current_streak,
  }));

  // Sent vs received
  const sentReceivedQuery = `
    SELECT
      SUM(CASE WHEN is_from_me = 1 THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN is_from_me = 0 THEN 1 ELSE 0 END) as received
    FROM message
  `;

  const sentReceived = db.prepare(sentReceivedQuery).get() as any;

  // Activity by hour (0-23)
  const activityByHourQuery = `
    SELECT
      CAST(strftime('%H', datetime(date/1000000000 + 978307200, 'unixepoch', 'localtime')) AS INTEGER) as hour,
      COUNT(*) as count
    FROM message
    GROUP BY hour
    ORDER BY hour
  `;

  const activityByHour = db.prepare(activityByHourQuery).all() as any[];

  // Messages over time (by month)
  const messagesOverTimeQuery = `
    SELECT
      strftime('%Y-%m', datetime(date/1000000000 + 978307200, 'unixepoch', 'localtime')) as period,
      COUNT(*) as count,
      SUM(CASE WHEN is_from_me = 1 THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN is_from_me = 0 THEN 1 ELSE 0 END) as received
    FROM message
    GROUP BY period
    ORDER BY period
  `;

  const messagesOverTime = db.prepare(messagesOverTimeQuery).all() as any[];

  // Messages by day of week
  const messagesByDayQuery = `
    SELECT
      CAST(strftime('%w', datetime(date/1000000000 + 978307200, 'unixepoch', 'localtime')) AS INTEGER) as day_of_week,
      COUNT(*) as count
    FROM message
    GROUP BY day_of_week
    ORDER BY day_of_week
  `;

  const messagesByDay = db.prepare(messagesByDayQuery).all() as any[];

  return {
    overview: {
      totalMessages: overview.total_messages || 0,
      totalConversations: overview.total_conversations || 0,
      totalAttachments: overview.total_attachments || 0,
      dateRange: {
        earliest: overview.earliest_date ? appleEpochToDate(overview.earliest_date) : null,
        latest: overview.latest_date ? appleEpochToDate(overview.latest_date) : null,
      },
    },
    topContacts,
    topContactsByPeriod,
    streaks,
    messagesOverTime,
    sentVsReceived: {
      sent: sentReceived.sent || 0,
      received: sentReceived.received || 0,
    },
    activityByHour,
    messagesByDay: messagesByDay.map((row) => ({
      dayOfWeek: row.day_of_week,
      count: row.count,
    })),
  };
}

/**
 * Get total count of conversations
 */
export function getConversationCount(): number {
  const db = getChatDb();

  const query = `
    SELECT COUNT(DISTINCT c.ROWID) as count
    FROM chat c
    JOIN chat_message_join cmj ON c.ROWID = cmj.chat_id
  `;

  const result = db.prepare(query).get() as any;
  return result.count || 0;
}

/**
 * Get a specific conversation by ID
 */
export function getConversation(chatId: number): Conversation | null {
  const db = getChatDb();

  const query = `
    SELECT
      c.ROWID as id,
      c.chat_identifier,
      c.display_name,
      c.style,
      MAX(m.date) as last_message_date,
      (
        SELECT m2.text
        FROM message m2
        JOIN chat_message_join cmj2 ON m2.ROWID = cmj2.message_id
        WHERE cmj2.chat_id = c.ROWID
        ORDER BY m2.date DESC
        LIMIT 1
      ) as last_message_text,
      (
        SELECT m2.attributedBody
        FROM message m2
        JOIN chat_message_join cmj2 ON m2.ROWID = cmj2.message_id
        WHERE cmj2.chat_id = c.ROWID
        ORDER BY m2.date DESC
        LIMIT 1
      ) as last_message_attributed_body,
      (
        SELECT m2.is_from_me
        FROM message m2
        JOIN chat_message_join cmj2 ON m2.ROWID = cmj2.message_id
        WHERE cmj2.chat_id = c.ROWID
        ORDER BY m2.date DESC
        LIMIT 1
      ) as last_message_is_from_me,
      COUNT(DISTINCT m.ROWID) as message_count
    FROM chat c
    LEFT JOIN chat_message_join cmj ON c.ROWID = cmj.chat_id
    LEFT JOIN message m ON cmj.message_id = m.ROWID
    WHERE c.ROWID = ?
    GROUP BY c.ROWID
  `;

  const stmt = db.prepare(query);
  const row = stmt.get(chatId) as any;

  if (!row) {
    return null;
  }

  const participants = getParticipantsForChat(row.id);
  const lastMessageText = row.last_message_text
    || extractTextFromAttributedBody(row.last_message_attributed_body)
    || null;

  return {
    id: row.id,
    chatIdentifier: row.chat_identifier,
    displayName: row.display_name || deriveDisplayName(row.chat_identifier, participants),
    isGroup: row.style === 43,
    lastMessageDate: row.last_message_date ? appleEpochToDate(row.last_message_date) : null,
    lastMessageText,
    lastMessageIsFromMe: row.last_message_is_from_me === 1,
    messageCount: row.message_count,
    participants,
  };
}
