"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { PhotoMonthBucket } from "@/types/database";

interface TimelineScrubberProps {
  buckets: PhotoMonthBucket[];
  visibleMonth: string | null;
  totalPhotos: number;
  onScrub: (yearMonth: string) => void;
}

export function TimelineScrubber({
  buckets,
  visibleMonth,
  totalPhotos,
  onScrub,
}: TimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTooltip, setDragTooltip] = useState<string | null>(null);

  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Group buckets by year
  const years = [...new Set(buckets.map((b) => b.year))].sort();

  // Calculate cumulative positions
  const bucketPositions = useMemo(() => {
    let cumulative = 0;
    return buckets.map((bucket) => {
      const start = cumulative;
      cumulative += bucket.count;
      return {
        ...bucket,
        start,
        end: cumulative,
      };
    });
  }, [buckets]);

  const getPositionForYearMonth = useCallback(
    (yearMonth: string): number | null => {
      const bucket = bucketPositions.find((b) => b.yearMonth === yearMonth);
      if (!bucket || totalPhotos === 0) return null;
      return (bucket.start + bucket.count / 2) / totalPhotos;
    },
    [bucketPositions, totalPhotos],
  );

  const getYearMonthFromPosition = useCallback(
    (position: number): string | null => {
      if (totalPhotos === 0 || buckets.length === 0) return null;
      const targetCount = position * totalPhotos;
      for (const bucket of bucketPositions) {
        if (targetCount <= bucket.end) {
          return bucket.yearMonth;
        }
      }
      return buckets[buckets.length - 1].yearMonth;
    },
    [bucketPositions, totalPhotos, buckets],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);

      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const position = Math.max(0, Math.min(1, y / rect.height));
        const yearMonth = getYearMonthFromPosition(position);
        if (yearMonth) {
          setDragTooltip(yearMonth);
          onScrub(yearMonth);
        }
      }
    },
    [getYearMonthFromPosition, onScrub],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const position = Math.max(0, Math.min(1, y / rect.height));
      const yearMonth = getYearMonthFromPosition(position);
      if (yearMonth) {
        setDragTooltip(yearMonth);
      }
    },
    [isDragging, getYearMonthFromPosition],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragTooltip(null);
  }, []);

  // Global pointer up listener
  useEffect(() => {
    if (isDragging) {
      const handleGlobalPointerUp = () => {
        setIsDragging(false);
        setDragTooltip(null);
      };
      const handleGlobalPointerMove = (e: PointerEvent) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const position = Math.max(0, Math.min(1, y / rect.height));
        const yearMonth = getYearMonthFromPosition(position);
        if (yearMonth) {
          setDragTooltip(yearMonth);
        }
      };
      window.addEventListener("pointerup", handleGlobalPointerUp);
      window.addEventListener("pointermove", handleGlobalPointerMove);
      return () => {
        window.removeEventListener("pointerup", handleGlobalPointerUp);
        window.removeEventListener("pointermove", handleGlobalPointerMove);
      };
    }
  }, [isDragging, getYearMonthFromPosition]);

  if (buckets.length === 0) {
    return null;
  }

  const visiblePosition = getPositionForYearMonth(visibleMonth || "");

  return (
    <div
      ref={trackRef}
      className="fixed right-0 top-0 bottom-0 w-12 flex flex-col items-center py-16 cursor-pointer z-20"
      style={{ background: "transparent" }}
      onPointerDown={handlePointerDown}
    >
      {/* Track */}
      <div
        className="w-1 flex-1 rounded-full relative"
        style={{ background: "var(--surface-hover)" }}
      >
        {/* Month markers */}
        {bucketPositions.map((bucket) => {
          if (totalPhotos === 0) return null;
          const topPercent = (bucket.start / totalPhotos) * 100;
          const heightPercent = (bucket.count / totalPhotos) * 100;
          return (
            <div
              key={bucket.yearMonth}
              className="absolute w-full rounded-full opacity-40"
              style={{
                top: `${topPercent}%`,
                height: `${Math.max(heightPercent, 0.5)}%`,
                background: "var(--accent)",
              }}
            />
          );
        })}

        {/* Visible indicator */}
        {visiblePosition !== null && !isDragging && (
          <div
            className="absolute left-0 w-3 -translate-x-1/2 h-3 rounded-full transition-all duration-200"
            style={{
              top: `${visiblePosition * 100}%`,
              background: "var(--accent)",
              boxShadow: "0 0 8px var(--accent)",
            }}
          />
        )}
      </div>

      {/* Year labels */}
      <div className="absolute right-full mr-3 top-16 bottom-6 flex flex-col justify-between pointer-events-none">
        {years.map((year) => {
          // Find position for January of each year
          const janBucket = bucketPositions.find(
            (b) => b.year === year && b.month === 1,
          );
          if (!janBucket || totalPhotos === 0) return null;
          const position = (janBucket.start / totalPhotos) * 100;
          return (
            <div
              key={year}
              className="text-xs font-medium"
              style={{
                position: "absolute",
                top: `${position}%`,
                transform: "translateY(-50%)",
                color: "var(--muted)",
              }}
            >
              {year}
            </div>
          );
        })}
      </div>

      {/* Drag tooltip */}
      {isDragging && dragTooltip && (
        <div
          className="fixed right-16 px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg pointer-events-none"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        >
          {(() => {
            const [year, month] = dragTooltip.split("-").map(Number);
            return `${MONTH_NAMES[month - 1]} ${year}`;
          })()}
        </div>
      )}
    </div>
  );
}
