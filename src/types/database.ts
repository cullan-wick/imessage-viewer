// Raw database row types matching chat.db schema

export interface MessageRow {
  ROWID: number;
  guid: string;
  text: string | null;
  handle_id: number;
  subject: string | null;
  date: number;
  date_read: number;
  date_delivered: number;
  is_from_me: number;
  is_read: number;
  is_sent: number;
  cache_has_attachments: number;
  cache_roomnames: string | null;
  item_type: number;
  other_handle: number;
  group_title: string | null;
  associated_message_guid: string | null;
  associated_message_type: number;
  balloon_bundle_id: string | null;
  expressive_send_style_id: string | null;
  thread_originator_guid: string | null;
  thread_originator_part: string | null;
  date_edited: number;
}

export interface ChatRow {
  ROWID: number;
  guid: string;
  style: number;
  state: number;
  account_id: string | null;
  chat_identifier: string;
  service_name: string;
  room_name: string | null;
  account_login: string | null;
  is_archived: number;
  last_addressed_handle: string | null;
  display_name: string | null;
  group_id: string | null;
  is_filtered: number;
  successful_query: number;
}

export interface HandleRow {
  ROWID: number;
  id: string;
  country: string | null;
  service: string;
  uncanonicalized_id: string | null;
}

export interface AttachmentRow {
  ROWID: number;
  guid: string;
  created_date: number;
  start_date: number;
  filename: string | null;
  uti: string | null;
  mime_type: string | null;
  transfer_state: number;
  is_outgoing: number;
  user_info: Buffer | null;
  transfer_name: string | null;
  total_bytes: number;
  is_sticker: number;
  sticker_user_info: Buffer | null;
  attribution_info: Buffer | null;
  hide_attachment: number;
  ck_sync_state: number;
  ck_server_change_token_blob: Buffer | null;
  ck_record_id: string | null;
  original_guid: string | null;
  is_commsafety_sensitive: number;
}

export interface ChatMessageJoinRow {
  chat_id: number;
  message_id: number;
  message_date: number;
}

export interface MessageAttachmentJoinRow {
  message_id: number;
  attachment_id: number;
}

// Domain types for application use

export interface Message {
  id: number;
  guid: string;
  text: string | null;
  date: Date;
  isFromMe: boolean;
  senderId: string | null;
  senderName: string | null;
  hasAttachments: boolean;
  attachments?: Attachment[];
  isRead: boolean;
  isSent: boolean;
  associatedMessageGuid: string | null;
  expressiveSendStyleId: string | null;
}

export interface Conversation {
  id: number;
  chatIdentifier: string;
  displayName: string | null;
  isGroup: boolean;
  lastMessageDate: Date | null;
  lastMessageText: string | null;
  lastMessageIsFromMe: boolean;
  messageCount: number;
  participants: Participant[];
  unreadCount?: number;
}

export interface Participant {
  id: number;
  contactId: string;
  displayName: string | null;
  service: string;
}

export interface Attachment {
  id: number;
  guid: string;
  filename: string | null;
  mimeType: string | null;
  transferName: string | null;
  totalBytes: number;
  isSticker: boolean;
  messageId?: number;
  messageDate?: Date;
}

export interface SearchResult {
  message: Message;
  conversation: Conversation;
  snippet: string;
  contextBefore?: Message[];
  contextAfter?: Message[];
  matchCount: number;
}

export type TopContactsPeriod = '7d' | '30d' | '6m' | '1y' | 'all';

export interface TopContact {
  name: string;
  identifier: string;
  messageCount: number;
  sentCount: number;
  receivedCount: number;
}

export interface StreakEntry {
  name: string;
  identifier: string;
  longestStreak: number;
  currentStreak: number;
}

export interface Statistics {
  overview: {
    totalMessages: number;
    totalConversations: number;
    totalAttachments: number;
    dateRange: {
      earliest: Date | null;
      latest: Date | null;
    };
  };
  topContacts: TopContact[];
  topContactsByPeriod: Record<TopContactsPeriod, TopContact[]>;
  streaks: StreakEntry[];
  messagesOverTime: Array<{
    period: string;
    count: number;
    sent: number;
    received: number;
  }>;
  sentVsReceived: {
    sent: number;
    received: number;
  };
  activityByHour: Array<{
    hour: number;
    count: number;
  }>;
  messagesByDay: Array<{
    dayOfWeek: number;
    count: number;
  }>;
}

export interface SearchFilters {
  dateFrom?: Date;
  dateTo?: Date;
  personIds?: number[];
  direction?: 'sent' | 'received' | 'all';
  hasAttachment?: boolean;
  chatType?: 'all' | 'group' | 'individual';
}
