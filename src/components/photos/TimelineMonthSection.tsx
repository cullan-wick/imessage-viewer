"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import type { PhotoEntry } from "@/types/database";
import { MediaItem } from "@/components/media/MediaItem";
import { MediaViewer } from "@/components/media/MediaViewer";

interface TimelineMonthSectionProps {
  yearMonth: string;
  photos: PhotoEntry[] | null;
  estimatedCount: number;
  onVisible: () => void;
  onPhotoClick: (index: number) => void;
  columns: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function TimelineMonthSection({
  yearMonth,
  photos,
  estimatedCount,
  onVisible,
  onPhotoClick,
  columns,
}: TimelineMonthSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const { ref: inViewRef, inView } = useInView({
    threshold: 0,
    rootMargin: "500px",
  });

  // Notify parent when visible
  useEffect(() => {
    if (inView) {
      onVisible();
    }
  }, [inView, onVisible]);

  // Calculate estimated height for placeholder
  const estimatedHeight = Math.ceil(estimatedCount / columns) * 150 + 60; // 150px per row + header

  const [year, month] = yearMonth.split("-").map(Number);
  const monthName = MONTH_NAMES[month - 1] || "";

  const handlePhotoClick = useCallback(
    (index: number) => {
      setViewerIndex(index);
      onPhotoClick(index);
    },
    [onPhotoClick],
  );

  const handleCloseViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (viewerIndex === null || !photos) return;
      if (direction === "prev" && viewerIndex > 0) {
        setViewerIndex(viewerIndex - 1);
      } else if (direction === "next" && viewerIndex < photos.length - 1) {
        setViewerIndex(viewerIndex + 1);
      }
    },
    [viewerIndex, photos],
  );

  return (
    <>
      <div
        ref={(node) => {
          sectionRef.current = node;
          inViewRef(node);
        }}
        id={`month-${yearMonth}`}
        className="min-h-[200px]"
      >
        {/* Month header */}
        <div
          className="sticky top-0 z-10 px-4 py-3"
          style={{ background: "var(--background)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            {monthName} {year}
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {photos ? photos.length : estimatedCount} photos
          </p>
        </div>

        {/* Content */}
        {photos && photos.length > 0 ? (
          <div className="px-4 pb-4">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {photos.map((photo, index) => (
                <MediaItem
                  key={photo.id}
                  attachment={photo}
                  onClick={() => handlePhotoClick(index)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Placeholder */
          <div
            className="mx-4 rounded-lg animate-pulse"
            style={{
              height: `${estimatedHeight}px`,
              background: "var(--surface-hover)",
            }}
          />
        )}
      </div>

      {/* Media Viewer */}
      {viewerIndex !== null && photos && (
        <MediaViewer
          media={photos}
          currentIndex={viewerIndex}
          onClose={handleCloseViewer}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}
