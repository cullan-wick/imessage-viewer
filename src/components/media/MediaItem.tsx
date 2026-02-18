"use client";

import { useState } from "react";
import type { Attachment } from "@/types/database";
import { isVideoFile } from "@/lib/utils/attachment-path";
import Image from "next/image";

interface MediaItemProps {
  attachment: Attachment;
  onClick: () => void;
}

export function MediaItem({ attachment, onClick }: MediaItemProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isVideo = isVideoFile(attachment.mimeType, attachment.filename);
  const attachmentUrl = `/api/attachments/${attachment.id}`;

  // For videos, try to show thumbnail from video element, fallback to play icon
  if (isVideo) {
    return (
      <div
        onClick={onClick}
        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
        style={{ background: "var(--surface-hover)" }}
      >
        <video
          src={attachmentUrl}
          className="w-full h-full object-cover"
          preload="metadata"
          muted
          onLoadedData={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
            <svg
              className="w-6 h-6 ml-0.5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  if (imageError) {
    return (
      <div
        className="aspect-square rounded-lg flex items-center justify-center"
        style={{ background: "var(--surface-hover)" }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: "var(--muted-light)" }}
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
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90 ${isLoading ? "animate-shimmer" : ""}`}
      style={{ background: "var(--surface-hover)" }}
    >
      <Image
        src={attachmentUrl}
        alt="Media"
        fill
        className="object-cover"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        unoptimized
      />
    </div>
  );
}
