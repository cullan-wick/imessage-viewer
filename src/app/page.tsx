"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ConversationList } from "@/components/sidebar/ConversationList";
import { ChatView } from "@/components/chat/ChatView";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { useSearch } from "@/lib/hooks/useSearch";
import { useState, useEffect, useCallback, Suspense } from "react";
import type { Conversation } from "@/types/database";

function HomeContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");
  const chatIdNum = chatId ? parseInt(chatId, 10) : null;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isIndexBuilt, setIsIndexBuilt] = useState<boolean | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const search = useSearch();

  // Check if search index is built
  useEffect(() => {
    fetch("/api/init-search")
      .then((res) => res.json())
      .then((data) => setIsIndexBuilt(data.isBuilt))
      .catch((error) => console.error("Error checking search index:", error));
  }, []);

  // Fetch conversation details when chatId changes
  // FIX: Search through all conversations instead of just limit=1
  useEffect(() => {
    if (!chatIdNum) {
      setConversation(null);
      return;
    }

    // Fetch enough conversations to find the selected one, or search by ID
    const findConversation = async () => {
      try {
        // First try to find in a reasonable batch
        const res = await fetch(`/api/conversations?limit=100&offset=0`);
        const data = await res.json();
        if (data.conversations) {
          const conv = data.conversations.find(
            (c: Conversation) => c.id === chatIdNum,
          );
          if (conv) {
            setConversation({
              ...conv,
              lastMessageDate: conv.lastMessageDate
                ? new Date(conv.lastMessageDate)
                : null,
            });
            return;
          }
        }
        // If not found in first 100, keep searching
        let offset = 100;
        while (data.hasMore) {
          const nextRes = await fetch(
            `/api/conversations?limit=100&offset=${offset}`,
          );
          const nextData = await nextRes.json();
          if (nextData.conversations) {
            const conv = nextData.conversations.find(
              (c: Conversation) => c.id === chatIdNum,
            );
            if (conv) {
              setConversation({
                ...conv,
                lastMessageDate: conv.lastMessageDate
                  ? new Date(conv.lastMessageDate)
                  : null,
              });
              return;
            }
          }
          if (!nextData.hasMore) break;
          offset += 100;
        }
        setConversation(null);
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };

    findConversation();
  }, [chatIdNum]);

  // Callback to receive conversation from sidebar click
  const handleConversationSelect = useCallback((conv: Conversation) => {
    setConversation(conv);
  }, []);

  // Build search index
  const buildSearchIndex = async () => {
    setIsBuilding(true);
    setBuildProgress("Initializing...");
    try {
      const res = await fetch("/api/init-search", { method: "POST" });
      const data = await res.json();
      if (data.status === "completed") {
        setIsIndexBuilt(true);
        setBuildProgress("");
      }
    } catch (error) {
      console.error("Error building search index:", error);
      setBuildProgress("Failed. Check console.");
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Search index banner */}
      {isIndexBuilt === false && (
        <div
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3 animate-slide-down"
          style={{
            background: "var(--accent-soft)",
            borderBottom: "1px solid var(--accent)",
          }}
        >
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent)", color: "white" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Search index not built
                </p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {isBuilding
                    ? buildProgress || "Building index..."
                    : "Build the index to enable full-text search."}
                </p>
              </div>
            </div>
            <button
              onClick={buildSearchIndex}
              disabled={isBuilding}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{
                background: isBuilding ? "var(--muted-light)" : "var(--accent)",
                color: "white",
                opacity: isBuilding ? 0.7 : 1,
              }}
            >
              {isBuilding ? "Building..." : "Build Now"}
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className={`flex w-full ${isIndexBuilt === false ? "pt-14" : ""}`}>
        {/* Sidebar */}
        <ConversationList onConversationSelect={handleConversationSelect} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
            style={{
              borderBottom: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            <div className="flex-1 max-w-xl">
              <SearchBar
                value={search.query}
                onChange={search.setQuery}
                onFocus={() => setIsSearchOpen(true)}
                isLoading={search.isLoading}
              />
            </div>

            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="p-2 rounded-lg transition-colors relative"
              style={{
                background: isFilterPanelOpen
                  ? "var(--accent-soft)"
                  : "transparent",
                color: isFilterPanelOpen ? "var(--accent)" : "var(--muted)",
              }}
              title="Toggle filters"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>

            <Link
              href="/stats"
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--muted)" }}
              title="Analytics"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </Link>

            <Link
              href="/contacts"
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--muted)" }}
              title="Contacts"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>

            <Link
              href="/photos"
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--muted)" }}
              title="Photos"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </Link>
          </div>

          {/* Chat view */}
          <div className="flex-1 flex overflow-hidden">
            {chatIdNum ? (
              <ChatView chatId={chatIdNum} conversation={conversation} />
            ) : (
              <div
                className="flex-1 flex items-center justify-center"
                style={{ background: "var(--background)" }}
              >
                <div className="text-center animate-fade-in">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <svg
                      className="w-9 h-9"
                      style={{ color: "var(--muted-light)" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Select a conversation
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    Choose from the sidebar to start reading
                  </p>
                </div>
              </div>
            )}

            {/* Filter panel */}
            <FilterPanel
              filters={search.filters}
              onFiltersChange={search.setFilters}
              isOpen={isFilterPanelOpen}
              onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            />
          </div>
        </div>
      </div>

      {/* Search results overlay */}
      <SearchResults
        results={search.results}
        isLoading={search.isLoading}
        error={search.error}
        query={search.query}
        total={search.total}
        hasMore={search.hasMore}
        onLoadMore={search.loadMore}
        onClose={() => {
          setIsSearchOpen(false);
          search.clear();
        }}
        isOpen={
          isSearchOpen && (search.query.length > 0 || search.results.length > 0)
        }
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div
          className="flex h-screen items-center justify-center"
          style={{ background: "var(--background)" }}
        >
          <div
            className="animate-pulse-gentle"
            style={{ color: "var(--muted)" }}
          >
            Loading...
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
