// Shared YouTube helpers — robustly extract a video ID from any common
// YouTube URL format (watch, youtu.be, shorts, embed, live, /v/).
export function isYouTubeId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{11}$/.test(value.trim());
}

export function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  const clean = url.trim();
  if (isYouTubeId(clean)) return clean;
  const match = clean.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// Resolve the best YouTube ID for a listing from any of its video fields.
export function getListingYouTubeId(listing) {
  if (!listing) return null;

  if (listing.youtube_video_id) {
    const id = String(listing.youtube_video_id).trim();
    if (isYouTubeId(id)) return id;
    const extracted = extractYouTubeId(id);
    if (extracted) return extracted;
  }

  return (
    extractYouTubeId(listing.youtube_url) ||
    extractYouTubeId(listing.preview_video_url) ||
    extractYouTubeId(listing.video_url) ||
    null
  );
}