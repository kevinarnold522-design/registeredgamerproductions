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

  if (errored) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-gray-900 text-gray-600 ${className}`}>
        <Play className="w-10 h-10" />
        <p className="text-xs">Preview unavailable</p>
      </div>
    );
  }

  if (ytId) {
    if (playing) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
          title="Preview"
          className={`w-full h-full ${className}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className={`relative block w-full h-full group ${className}`}
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
      className={className}
      onError={() => setErrored(true)}
    />
  );
}