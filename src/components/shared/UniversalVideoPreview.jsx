import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { extractYouTubeId } from "@/lib/youtube";

// Universal preview: accepts a YouTube URL (-> thumbnail that loads the
// embed on click) or an uploaded video URL (-> <video>).
// The click-to-play approach renders reliably everywhere (thumbnails are
// plain images and never blocked), then swaps to the real YouTube player.
export default function UniversalVideoPreview({ url, poster, className = "" }) {
  const [errored, setErrored] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [embedHost, setEmbedHost] = useState("www.youtube.com");
  const [embedFailed, setEmbedFailed] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  useEffect(() => {
    setErrored(false);
    setPlaying(false);
    setEmbedHost("www.youtube.com");
    setEmbedFailed(false);
    setEmbedLoaded(false);
  }, [url]);

  if (!url) return null;

  const ytId = extractYouTubeId(url);

  useEffect(() => {
    if (!playing || !ytId || embedLoaded || embedFailed) return;
    const timeout = setTimeout(() => {
      if (embedHost === "www.youtube.com") {
        setEmbedLoaded(false);
        setEmbedHost("www.youtube-nocookie.com");
        return;
      }
      setEmbedFailed(true);
    }, 4500);

    return () => clearTimeout(timeout);
  }, [playing, ytId, embedLoaded, embedFailed, embedHost]);

  // Always fill the parent box so the player/thumbnail can't collapse to
  // zero height inside flex/grid containers.
  const fill = "absolute inset-0 w-full h-full";
  const blockedLayoutPrefixes = [
    "absolute",
    "fixed",
    "inset-",
    "top-",
    "right-",
    "bottom-",
    "left-",
    "z-",
    "h-screen",
    "min-h-screen",
    "w-screen",
  ];
  const safeClassName = String(className || "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !blockedLayoutPrefixes.some((prefix) => token === prefix || token.startsWith(prefix) || token.startsWith(`!${prefix}`)))
    .join(" ");
  const container = `uvp-lock relative isolate [contain:layout_paint] w-full h-full overflow-hidden ${safeClassName}`;

  if (errored) {
    return (
      <div className={container}>
        <div className={`${fill} flex flex-col items-center justify-center gap-2 bg-gray-900 text-gray-600`}>
          <Play className="w-10 h-10" />
          <p className="text-xs">Preview unavailable</p>
        </div>
      </div>
    );
  }

  if (ytId) {
    const youtubeWatchUrl = `https://www.youtube.com/watch?v=${ytId}`;
    if (playing) {
      return (
        <div className={container}>
          {!embedFailed ? (
            <iframe
              src={`https://${embedHost}/embed/${ytId}?autoplay=1&rel=0&playsinline=1&modestbranding=1&fs=0`}
              title="Video player"
              key={`${ytId}-${embedHost}`}
              className={fill}
              frameBorder="0"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
              onLoad={() => setEmbedLoaded(true)}
              onError={() => {
                if (embedHost === "www.youtube.com") {
                  setEmbedLoaded(false);
                  setEmbedHost("www.youtube-nocookie.com");
                  return;
                }
                setEmbedFailed(true);
              }}
            />
          ) : (
            <div className={`${fill} flex flex-col items-center justify-center gap-3 bg-gray-900/95 text-gray-300 p-4 text-center`}>
              <p className="text-sm font-semibold">Embed blocked in this browser/network</p>
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Open on YouTube
              </a>
            </div>
          )}
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setEmbedHost("www.youtube.com");
          setEmbedFailed(false);
          setEmbedLoaded(false);
          setPlaying(true);
        }}
        className={`${container} block group`}
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
      className={`w-full h-full ${safeClassName || "object-contain"}`}
      onError={() => setErrored(true)}
    />
  );
}
