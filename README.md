# iMessage Viewer

A full-stack web application to search, browse, and analyze iMessage conversations from macOS. Built with Next.js 16, TypeScript, and SQLite.

## Features

- **Full-Text Search** - Fast FTS5-powered search across all messages with filters
- **iMessage-Style UI** - Authentic blue/gray bubble interface with dark mode support
- **Analytics Dashboard** - Visualize messaging patterns, streaks, and activity over time
- **Contacts Page** - Per-contact breakdowns with activity charts and timelines
- **Photos Page** - Browse photos and videos by contact or chronological timeline
- **Media Gallery** - Inline media browser with lightbox viewer
- **Filter Panel** - Filter messages by date range, direction, and attachment type
- **Privacy-First** - Runs locally, no data leaves your machine
- **High Performance** - Virtual scrolling for thousands of messages

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (CSS variables, Apple-style design tokens)
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
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Main chat view
│   ├── contacts/           # Contacts overview page
│   ├── photos/             # Photos & media timeline page
│   ├── stats/              # Statistics dashboard page
│   └── api/
│       ├── conversations/  # Conversation list and detail
│       ├── messages/       # Message fetching (paginated)
│       ├── search/         # FTS5 full-text search
│       ├── contacts/       # Contact stats and per-contact data
│       ├── stats/          # Aggregate analytics data
│       ├── media/          # Media gallery endpoints
│       ├── photos/         # Photos timeline endpoints
│       ├── attachments/    # Attachment serving
│       └── init-search/    # Search index initialization
├── components/
│   ├── sidebar/            # Conversation list, items, skeleton
│   ├── chat/               # Chat view, message bubbles, groups, date dividers, attachments
│   ├── search/             # Search bar, results, result items
│   ├── filters/            # Filter panel, date picker, dropdowns
│   ├── media/              # Media gallery, grid, items, lightbox viewer
│   ├── contacts/           # Contact list, detail, activity/timeline charts
│   ├── photos/             # Photos by contact, timeline, month sections, scrubber
│   └── stats/              # Overview, messages-over-time, sent/received, top contacts,
│                           # activity hours, streak, and cumulative charts
├── lib/
│   ├── db/                 # Database connection, queries, search index
│   ├── hooks/              # Custom React hooks (useSearch)
│   └── utils/              # Date conversion, attachment paths, formatting, contacts, typedstream
└── types/                  # TypeScript type definitions (database.ts, api.ts)
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main view: conversation sidebar + iMessage-style chat |
| `/stats` | Analytics dashboard with charts and messaging statistics |
| `/contacts` | Per-contact breakdown with activity and timeline charts |
| `/photos` | Media timeline browser, filterable by contact |

## Database Architecture

- **chat.db** (read-only) - System iMessage database, never modified
- **search_index.db** (generated) - FTS5 virtual table for full-text search

## Current Features

- Browse all conversations with virtual scrolling
- iMessage-style message bubbles (sent/received, corner rounding, grouping)
- Infinite scroll for messages with date grouping
- Full-text search with FTS5 across all messages
- Filter messages by date range, direction, and attachment type
- Attachment previews inline (images, videos, files)
- Media gallery with lightbox viewer
- Photos timeline grouped by month with scrubber navigation
- Statistics dashboard: messages over time, sent/received ratio, top contacts, activity heatmap, streaks, cumulative totals
- Per-contact analytics: message history, activity chart, timeline breakdown
- Top contacts per time period (week, month, all-time)
- Longest texting streak tracking
- Contact name resolution from macOS Contacts
- Dark mode support

## Testing the App

Once you have the app running:

1. **Verify database connection**: The conversations list should load on the left side
2. **Browse conversations**: Scroll through the list, use the search bar to filter by name
3. **View messages**: Click a conversation to see messages on the right
4. **Full-text search**: Open the search panel to search across all messages
5. **Apply filters**: Use the filter panel to narrow by date, direction, or attachments
6. **Build search index**: Click "Build Now" in the banner (one-time setup)
7. **Explore stats**: Visit `/stats` for analytics and charts
8. **Browse contacts**: Visit `/contacts` for per-person breakdowns
9. **View photos**: Visit `/photos` to browse all media chronologically

**Common Issues:**
- If no conversations show up, verify `CHAT_DB_PATH` points to your actual `chat.db`
- If images don't load, verify `ATTACHMENTS_PATH` is correct
- Check the browser console for any errors

## License

MIT

## Privacy Notice

This application reads your local iMessage database in read-only mode. No data is uploaded or shared. All processing happens locally on your machine.
