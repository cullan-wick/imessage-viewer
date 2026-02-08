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

🚧 **In Progress** - Currently implementing Phase 1 (Foundation)

- [x] Project setup and dependencies
- [x] TypeScript type definitions
- [x] Date conversion utilities
- [x] Attachment path utilities
- [ ] Database connection manager
- [ ] Core database queries
- [ ] FTS5 search index
- [ ] API routes
- [ ] UI components
- [ ] Statistics dashboard

## License

MIT

## Privacy Notice

This application reads your local iMessage database in read-only mode. No data is uploaded or shared. All processing happens locally on your machine.
