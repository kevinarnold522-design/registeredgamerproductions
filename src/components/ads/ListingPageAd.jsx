import { useEffect } from "react";

// Injects the quge5 ad tag once on every listing landing page.
// Hidden for ad-free users (signed-in admins, no_ads, account moderators).
export default function ListingPageAd({ adFree }) {
  useEffect(() => {
    if (adFree) return;
    const SRC = "https://quge5.com/88/tag.min.js";
    if (document.querySelector(`script[src="${SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.setAttribute("data-zone", "252023");
    s.setAttribute("data-cfasync", "false");
    document.body.appendChild(s);
  }, [adFree]);

  return null;
}