import React, { useState } from "react";
import { Play } from "lucide-react";
import { extractYouTubeId } from "@/lib/youtube";

// Universal preview: accepts a YouTube URL (-> thumbnail that loads the
// embed on click) or an uploaded video URL (-> <video>).
// The click-to-play approach renders reliably everywhere (thumbnails are
// plain images and never blocked), then swaps to the real YouTube player.
export default function UniversalVideoPreview({ url, poster, className = "" }) {
  const [errored, setErrored] = useState(false);
  const [playing, setPlaying] = useState(false);
  if (!url) return null;

  const ytId = extractYouTubeId(url);

  // Always fill the parent box so the player/thumbnail can't collapse to
  // zero height inside flex/grid containers.
  const fill = "absolute inset-0 w-full h-full";

  if (errored) {
    return (
      <div className={`${fill} flex flex-col items-center justify-center gap-2 bg-gray-900 text-gray-600 ${className}`}>
        <Play className="w-10 h-10" />
        <p className="text-xs">Preview unavailable</p>
      </div>
    );
  }

  if (ytId) {
    if (playing) {
      return (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`}
          title="Video player"
          className={`${fill} ${className}`}
          frameBorder="0"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }
    return (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlaying(true); }}
        className={`${fill} block group ${className}`}
      >
        <img
          src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
          alt="Video preview"
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
          <span className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </span>
        </span>
      </button>
    );
  }

  return (
    <video
      src={url}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      className={`${fill} object-contain ${className}`}
      onError={() => setErrored(true)}
    />
  );
}