// Shared YouTube helpers — robustly extract a video ID from any common
// YouTube URL format (watch, youtu.be, shorts, embed, live, /v/).
export function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  const clean = url.trim();
  const match = clean.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// Resolve the best YouTube ID for a listing from any of its video fields.
export function getListingYouTubeId(listing) {
  if (!listing) return null;
  return (
    listing.youtube_video_id ||
    extractYouTubeId(listing.youtube_url) ||
    extractYouTubeId(listing.preview_video_url) ||
    extractYouTubeId(listing.video_url) ||
    null
  );
}