import Database from 'better-sqlite3';
import path from 'path';

let chatDb: Database.Database | null = null;
let searchDb: Database.Database | null = null;

/**
 * Get connection to the system iMessage database (read-only)
 * Uses singleton pattern to reuse connection
 */
export function getChatDb(): Database.Database {
  if (chatDb) {
    return chatDb;
  }

  const chatDbPath = process.env.CHAT_DB_PATH;

  if (!chatDbPath) {
    throw new Error('CHAT_DB_PATH environment variable is not set. Please configure it in .env.local');
  }

  try {
    // Open in read-only mode to prevent accidental modifications
    chatDb = new Database(chatDbPath, { readonly: true, fileMustExist: true });

    // Configure for better performance
    chatDb.pragma('journal_mode = WAL');
    chatDb.pragma('synchronous = NORMAL');

    console.log(`[DB] Connected to chat.db at ${chatDbPath}`);

    return chatDb;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect to chat.db at ${chatDbPath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get connection to the search index database (writable)
 * This database contains the FTS5 virtual table for full-text search
 * Uses singleton pattern to reuse connection
 */
export function getSearchDb(): Database.Database {
  if (searchDb) {
    return searchDb;
  }

  // Store search index in project root (not in user's Library)
  const searchDbPath = path.join(process.cwd(), 'search_index.db');

  try {
    // Create or open the database (writable)
    searchDb = new Database(searchDbPath);

    // Configure for better performance
    searchDb.pragma('journal_mode = WAL');
    searchDb.pragma('synchronous = NORMAL');
    searchDb.pragma('cache_size = 10000');

    console.log(`[DB] Connected to search_index.db at ${searchDbPath}`);

    return searchDb;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to connect to search_index.db at ${searchDbPath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Close database connections
 * Should be called when shutting down the application
 */
export function closeDatabases(): void {
  if (chatDb) {
    chatDb.close();
    chatDb = null;
    console.log('[DB] Closed chat.db connection');
  }

  if (searchDb) {
    searchDb.close();
    searchDb = null;
    console.log('[DB] Closed search_index.db connection');
  }
}

/**
 * Check if chat database is accessible
 * Useful for health checks or initialization
 */
export function isChatDbAccessible(): boolean {
  try {
    const db = getChatDb();
    // Try a simple query to verify access
    const result = db.prepare('SELECT 1').get();
    return result !== undefined;
  } catch (error) {
    console.error('[DB] Chat database not accessible:', error);
    return false;
  }
}

/**
 * Get database statistics
 * Returns info about the databases for debugging/monitoring
 */
export function getDatabaseStats(): {
  chatDb: { connected: boolean; path: string | null };
  searchDb: { connected: boolean; path: string | null };
} {
  return {
    chatDb: {
      connected: chatDb !== null && chatDb.open,
      path: process.env.CHAT_DB_PATH || null,
    },
    searchDb: {
      connected: searchDb !== null && searchDb.open,
      path: searchDb ? path.join(process.cwd(), 'search_index.db') : null,
    },
  };
}

// Handle process termination gracefully
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    closeDatabases();
  });

  process.on('SIGINT', () => {
    closeDatabases();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    closeDatabases();
    process.exit(0);
  });
}
