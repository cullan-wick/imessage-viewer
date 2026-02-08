import type { Conversation, Message, SearchResult, Statistics, Attachment } from './database';

// API Response types

export interface ConversationsResponse {
  conversations: Conversation[];
  hasMore: boolean;
  total: number;
}

export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  chatId: number;
}

export interface SearchResponse {
  results: SearchResult[];
  hasMore: boolean;
  total: number;
  query: string;
}

export interface MediaResponse {
  media: Attachment[];
  hasMore: boolean;
  total: number;
}

export interface StatsResponse extends Statistics {}

export interface InitSearchResponse {
  status: 'completed' | 'in_progress' | 'error';
  messagesIndexed: number;
  duration: number;
  error?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// API Request query parameters

export interface ConversationsQuery {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface MessagesQuery {
  limit?: number;
  before?: string; // ISO date string
  offset?: number;
}

export interface SearchQuery {
  q: string;
  dateFrom?: string;
  dateTo?: string;
  personId?: string;
  direction?: 'sent' | 'received' | 'all';
  hasAttachment?: 'true' | 'false';
  chatType?: 'all' | 'group' | 'individual';
  limit?: number;
  offset?: number;
}

export interface MediaQuery {
  type?: 'image' | 'video' | 'all';
  limit?: number;
  offset?: number;
}
