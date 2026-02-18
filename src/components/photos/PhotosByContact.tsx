"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useInView } from "react-intersection-observer";
import type { PhotoEntry } from "@/types/database";
import { MediaItem } from "@/components/media/MediaItem";
import { MediaViewer } from "@/components/media/MediaViewer";

interface PhotosByContactProps {
  contact: string | null;
}

export function PhotosByContact({ contact }: PhotosByContactProps) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const limit = 100;
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  // Reset when contact changes
  useEffect(() => {
    setPhotos([]);
    setOffset(0);
    setHasMore(false);
    setIsLoading(true);
    setError(null);
    fetchPhotos(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  // Load more when scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchPhotos(offset, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const fetchPhotos = async (offsetParam: number, reset: boolean) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offsetParam.toString(),
      });

      if (contact) {
        params.set("contact", contact);
      }

      const res = await fetch(`/api/photos?${params}`);
      if (!res.ok) throw new Error("Failed to fetch photos");

      const data = await res.json();

      if (reset) {
        setPhotos(data.photos);
      } else {
        setPhotos((prev) => [...prev, ...data.photos]);
      }

      setHasMore(data.hasMore);
      setOffset(offsetParam + limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = useCallback((index: number) => {
    setViewerIndex(index);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setViewerIndex(null);
  }, []);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (viewerIndex === null) return;
      if (direction === "prev" && viewerIndex > 0) {
        setViewerIndex(viewerIndex - 1);
      } else if (direction === "next" && viewerIndex < photos.length - 1) {
        setViewerIndex(viewerIndex + 1);
      }
    },
    [viewerIndex, photos.length],
  );

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p
            className="text-base font-semibold mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Error Loading Photos
          </p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && photos.length === 0) {
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
            Loading photos...
          </p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
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
            {contact ? "No photos from this contact" : "No photos found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1">
          {photos.map((photo, index) => (
            <MediaItem
              key={photo.id}
              attachment={photo}
              onClick={() => handlePhotoClick(index)}
            />
          ))}
        </div>

        {/* Load more sentinel */}
        {hasMore && (
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {isLoading && (
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: "var(--accent)",
                  borderTopColor: "transparent",
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Media Viewer */}
      {viewerIndex !== null && (
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
