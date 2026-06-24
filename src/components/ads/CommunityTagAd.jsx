import { useEffect } from "react";

// Injects the quge5 ad tag (zone 253132) on modding/gaming community and
// subcategory landing pages. Skips ad-free users and never runs inside the
// builder preview iframe.
export default function CommunityTagAd({ adFree = false }) {
  useEffect(() => {
    if (adFree) return;
    try { if (window.self !== window.top) return; } catch { return; }
    if (document.getElementById("__community_tag_ad")) return;

    const s = document.createElement("script");
    s.id = "__community_tag_ad";
    s.src = "https://quge5.com/88/tag.min.js";
    s.dataset.zone = "253132";
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    document.body.appendChild(s);

    return () => {
      const el = document.getElementById("__community_tag_ad");
      if (el) el.remove();
    };
  }, [adFree]);

  return null;
}