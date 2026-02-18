"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PhotoContact } from "@/types/database";
import { ContactPicker } from "@/components/photos/ContactPicker";
import { PhotosByContact } from "@/components/photos/PhotosByContact";
import { PhotosTimeline } from "@/components/photos/PhotosTimeline";

type ViewMode = "by-contact" | "timeline";

function PhotosContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") as ViewMode | null;

  const [viewMode, setViewMode] = useState<ViewMode>(
    initialView || "by-contact",
  );
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [contacts, setContacts] = useState<PhotoContact[]>([]);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  // Fetch contacts with photo counts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoadingContacts(true);
        const res = await fetch("/api/photos/contacts");
        if (!res.ok) throw new Error("Failed to fetch contacts");

        const data = await res.json();
        setContacts(data.contacts);
        const total = data.contacts.reduce(
          (sum: number, c: PhotoContact) => sum + c.photoCount,
          0,
        );
        setTotalPhotos(total);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchContacts();
  }, []);

  const handleContactSelect = (identifier: string | null) => {
    setSelectedContact(identifier);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Sidebar - only show in By Contact mode */}
      {viewMode === "by-contact" && (
        <ContactPicker
          contacts={contacts}
          selected={selectedContact}
          onSelect={handleContactSelect}
          isLoading={isLoadingContacts}
          totalPhotos={totalPhotos}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg transition-colors"
              style={{ color: "var(--muted)" }}
              title="Back to Messages"
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
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              Photos
            </h1>
          </div>

          {/* View toggle */}
          <div
            className="flex rounded-lg p-1"
            style={{ background: "var(--surface-hover)" }}
          >
            <button
              onClick={() => setViewMode("by-contact")}
              className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
              style={{
                background:
                  viewMode === "by-contact" ? "var(--surface)" : "transparent",
                color:
                  viewMode === "by-contact"
                    ? "var(--foreground)"
                    : "var(--muted)",
                boxShadow:
                  viewMode === "by-contact"
                    ? "0 1px 2px rgba(0,0,0,0.1)"
                    : "none",
              }}
            >
              By Contact
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className="px-4 py-1.5 text-sm font-medium rounded-md transition-colors"
              style={{
                background:
                  viewMode === "timeline" ? "var(--surface)" : "transparent",
                color:
                  viewMode === "timeline"
                    ? "var(--foreground)"
                    : "var(--muted)",
                boxShadow:
                  viewMode === "timeline"
                    ? "0 1px 2px rgba(0,0,0,0.1)"
                    : "none",
              }}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === "by-contact" ? (
            <PhotosByContact contact={selectedContact} />
          ) : (
            <PhotosTimeline contact={selectedContact || undefined} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PhotosPage() {
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
      <PhotosContent />
    </Suspense>
  );
}
