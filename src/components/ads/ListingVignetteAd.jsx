import { useEffect } from "react";

// Injects the vignette ad script on listing landing pages only.
// Skips admins / ad-free / moderators, and never runs inside the editor iframe.
export default function ListingVignetteAd({ adFree = false }) {
  useEffect(() => {
    if (adFree) return;
    // Don't inject inside an embedded iframe (e.g. the builder preview)
    try { if (window.self !== window.top) return; } catch { return; }
    if (document.getElementById("__listing_vignette_ad")) return;

    const s = document.createElement("script");
    s.id = "__listing_vignette_ad";
    s.dataset.zone = "11195236";
    s.src = "https://n6wxm.com/vignette.min.js";
    document.body.appendChild(s);

    return () => {
      const el = document.getElementById("__listing_vignette_ad");
      if (el) el.remove();
    };
  }, [adFree]);

  return null;
}