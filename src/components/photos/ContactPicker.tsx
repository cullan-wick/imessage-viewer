"use client";

import type { PhotoContact } from "@/types/database";

interface ContactPickerProps {
  contacts: PhotoContact[];
  selected: string | null;
  onSelect: (identifier: string | null) => void;
  isLoading: boolean;
  totalPhotos: number;
}

export function ContactPicker({
  contacts,
  selected,
  onSelect,
  isLoading,
  totalPhotos,
}: ContactPickerProps) {
  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div
        className="w-64 flex-shrink-0 border-r"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div
              className="h-10 rounded-lg"
              style={{ background: "var(--surface-hover)" }}
            />
            <div
              className="h-10 rounded-lg"
              style={{ background: "var(--surface-hover)" }}
            />
            <div
              className="h-10 rounded-lg"
              style={{ background: "var(--surface-hover)" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-64 flex-shrink-0 border-r overflow-y-auto"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="p-3">
        {/* All Photos option */}
        <button
          onClick={() => onSelect(null)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1"
          style={{
            background:
              selected === null ? "var(--accent-soft)" : "transparent",
            color: selected === null ? "var(--accent)" : "var(--foreground)",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">All Photos</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {totalPhotos.toLocaleString()} photos
            </div>
          </div>
        </button>

        {/* Contact list */}
        <div className="space-y-1 mt-2">
          {contacts.map((contact) => (
            <button
              key={contact.identifier}
              onClick={() => onSelect(contact.identifier)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
              style={{
                background:
                  selected === contact.identifier
                    ? "var(--accent-soft)"
                    : "transparent",
                color:
                  selected === contact.identifier
                    ? "var(--accent)"
                    : "var(--foreground)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                style={{
                  background:
                    selected === contact.identifier
                      ? "var(--accent)"
                      : "var(--surface-hover)",
                  color:
                    selected === contact.identifier ? "white" : "var(--muted)",
                }}
              >
                {getInitials(contact.displayName)}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium truncate">
                  {contact.displayName || contact.identifier}
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {contact.photoCount.toLocaleString()} photos
                </div>
              </div>
            </button>
          ))}
        </div>

        {contacts.length === 0 && (
          <div className="text-center py-8" style={{ color: "var(--muted)" }}>
            <p className="text-sm">No photos found</p>
          </div>
        )}
      </div>
    </div>
  );
}
