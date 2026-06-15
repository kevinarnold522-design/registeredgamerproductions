import React, { useState } from "react";
import { Play } from "lucide-react";

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/);
  return match ? match[1] : null;
}

// Universal preview: accepts a YouTube URL (-> iframe) or an uploaded video URL (-> <video>).
// Falls back to a graceful placeholder on missing/broken media.
export default function UniversalVideoPreview({ url, poster, className = "" }) {
  const [errored, setErrored] = useState(false);
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
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}`}
        title="Preview"
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={() => setErrored(true)}
      />
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