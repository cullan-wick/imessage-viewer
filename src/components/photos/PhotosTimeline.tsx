"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PhotoMonthBucket, PhotoEntry } from "@/types/database";
import { TimelineMonthSection } from "./TimelineMonthSection";
import { TimelineScrubber } from "./TimelineScrubber";

interface PhotosTimelineProps {
  contact?: string;
}

export function PhotosTimeline({ contact }: PhotosTimelineProps) {
  const [buckets, setBuckets] = useState<PhotoMonthBucket[]>([]);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<string | null>(null);
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());
  const [monthPhotos, setMonthPhotos] = useState<Map<string, PhotoEntry[]>>(
    new Map(),
  );
  const [columns, setColumns] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine number of columns based on viewport
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1536) setColumns(7);
      else if (width >= 1280) setColumns(6);
      else if (width >= 1024) setColumns(5);
      else if (width >= 768) setColumns(4);
      else setColumns(3);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Fetch timeline buckets
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (contact) {
          params.set("contact", contact);
        }

        const res = await fetch(`/api/photos/timeline?${params}`);
        if (!res.ok) throw new Error("Failed to fetch timeline");

        const data = await res.json();
        setBuckets(data.buckets);
        setTotalPhotos(data.totalPhotos);

        // Set initial visible month to the most recent
        if (data.buckets.length > 0) {
          setVisibleMonth(data.buckets[data.buckets.length - 1].yearMonth);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load timeline",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [contact]);

  // Fetch photos for a specific month
  const fetchMonthPhotos = useCallback(
    async (yearMonth: string) => {
      if (loadedMonths.has(yearMonth)) return;

      try {
        const params = new URLSearchParams({
          yearMonth,
          limit: "200",
          offset: "0",
        });
        if (contact) {
          params.set("contact", contact);
        }

        const res = await fetch(`/api/photos?${params}`);
        if (!res.ok) throw new Error("Failed to fetch photos");

        const data = await res.json();
        setMonthPhotos((prev) => new Map(prev).set(yearMonth, data.photos));
        setLoadedMonths((prev) => new Set(prev).add(yearMonth));
      } catch (err) {
        console.error(`Failed to load photos for ${yearMonth}:`, err);
      }
    },
    [contact, loadedMonths],
  );

  // Handle scrubber navigation
  const handleScrub = useCallback((yearMonth: string) => {
    const element = document.getElementById(`month-${yearMonth}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Handle section visibility
  const handleSectionVisible = useCallback(
    (yearMonth: string) => {
      setVisibleMonth(yearMonth);
      fetchMonthPhotos(yearMonth);
    },
    [fetchMonthPhotos],
  );

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-base font-semibold mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Error Loading Timeline
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{
              borderColor: "var(--accent)",
              borderTopColor: "transparent",
            }}
          />
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Loading timeline...
          </p>
        </div>
      </div>
    );
  }

  if (buckets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-base font-semibold mb-1"
            style={{ color: "var(--foreground)" }}
          >
            No Photos
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No photos found in your message history
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ paddingRight: "48px" }}
      >
        {buckets.map((bucket) => (
          <TimelineMonthSection
            key={bucket.yearMonth}
            yearMonth={bucket.yearMonth}
            photos={monthPhotos.get(bucket.yearMonth) || null}
            estimatedCount={bucket.count}
            onVisible={() => handleSectionVisible(bucket.yearMonth)}
            onPhotoClick={() => {}}
            columns={columns}
          />
        ))}
      </div>

      <TimelineScrubber
        buckets={buckets}
        visibleMonth={visibleMonth}
        totalPhotos={totalPhotos}
        onScrub={handleScrub}
      />
    </>
  );
}
