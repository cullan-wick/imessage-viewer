# iMessage Viewer

A full-stack web application to search, browse, and analyze iMessage conversations from macOS. Built with Next.js 15, TypeScript, and SQLite.

## Features

- 🔍 **Full-Text Search** - Fast FTS5-powered search across all messages
- 💬 **iMessage-Style UI** - Authentic blue/gray bubble interface
- 📊 **Analytics Dashboard** - Visualize messaging patterns and statistics
- 🖼️ **Media Gallery** - Browse photos and videos from conversations
- 🔐 **Privacy-First** - Runs locally, no data leaves your machine
- ⚡ **High Performance** - Virtual scrolling for thousands of messages

## Tech Stack

- **Framework:** Next.js 15.1.6 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Database:** SQLite via better-sqlite3
- **Search:** FTS5 (Full-Text Search)
- **Charts:** recharts
- **Performance:** react-virtuoso, react-intersection-observer

## Prerequisites

- Node.js 18+ and npm
- macOS (for access to iMessage database)
- iMessage history at `~/Library/Messages/chat.db`

## Installation

1. Clone the repository:
```bash
git clone https://github.com/cullan-wick/imessage-viewer.git
cd imessage-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```bash
CHAT_DB_PATH=/Users/YOUR_USERNAME/Library/Messages/chat.db
ATTACHMENTS_PATH=/Users/YOUR_USERNAME/Library/Messages/Attachments/
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

7. Build the search index (first-time setup):
   - The app will prompt you to build the FTS5 search index on first load
   - This is a one-time operation that indexes all messages for fast searching

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components (sidebar, chat, search, filters, media, stats)
├── lib/             # Core logic (database, queries, search index)
├── types/           # TypeScript type definitions
└── utils/           # Utility functions (date conversion, formatting)
```

## Database Architecture

- **chat.db** (read-only) - System iMessage database, never modified
- **search_index.db** (generated) - FTS5 virtual table for full-text search

## Development Status

✅ **MVP Complete** - Core functionality working!

**Phase 1: Foundation** ✅
- [x] Project setup and dependencies
- [x] TypeScript type definitions
- [x] Date conversion utilities
- [x] Attachment path utilities
- [x] Database connection manager
- [x] Core database queries
- [x] FTS5 search index

**Phase 2: API Routes** ✅
- [x] Conversations API
- [x] Messages API
- [x] Search API
- [x] Attachments API
- [x] Media gallery API
- [x] Statistics API
- [x] Search index initialization API

**Phase 3: Core UI** ✅
- [x] Main page layout
- [x] Conversation list with virtual scrolling
- [x] Conversation items with search
- [x] Chat view with infinite scroll
- [x] Message bubbles (iMessage-style)
- [x] Message grouping
- [x] Date dividers
- [x] Attachment previews
- [x] Search index banner

**Phase 4-7: Coming Soon** 🚧
- [ ] Search functionality (search bar, results, filters)
- [ ] Filter panel (date range, person, direction, attachments)
- [ ] Media gallery (full-page browser, lightbox)
- [ ] Statistics dashboard (/stats page with charts)

**Current Features:**
- ✅ Browse all conversations
- ✅ View messages with iMessage-style bubbles
- ✅ Infinite scroll for conversations and messages
- ✅ Search conversations by name
- ✅ Attachment previews (images, videos, files)
- ✅ Date grouping and formatting
- ✅ Dark mode support
- ✅ Build search index for FTS5

## Testing the App

Once you have the app running:

1. **Verify database connection**: The conversations list should load on the left side
2. **Browse conversations**: Scroll through the list, use search to filter
3. **View messages**: Click a conversation to see messages on the right
4. **Test infinite scroll**: Scroll up in the chat to load older messages
5. **Build search index**: Click "Build Now" in the yellow banner (one-time setup)
6. **View attachments**: Images, videos, and files should display inline

**Common Issues:**
- If no conversations show up, verify `CHAT_DB_PATH` points to your actual chat.db file
- If images don't load, verify `ATTACHMENTS_PATH` is correct
- Check the browser console for any errors

## License

MIT

## Privacy Notice

This application reads your local iMessage database in read-only mode. No data is uploaded or shared. All processing happens locally on your machine.
