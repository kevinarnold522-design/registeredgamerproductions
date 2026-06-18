import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Tracks how long a visitor stays on a listing page (dwell / average stay time).
 * On unmount (or tab hide) it adds the elapsed seconds to the listing's
 * total_dwell_seconds and view_sessions counters, which feed the
 * "average stay" + watchtime-hours metrics shown across the app.
 *
 * Watchtime hours = total_dwell_seconds / 3600.
 * Average stay     = total_dwell_seconds / view_sessions.
 */
export function useDwellTracker(listing) {
  const startRef = useRef(Date.now());
  const savedRef = useRef(false);

  useEffect(() => {
    if (!listing?.id) return;
    startRef.current = Date.now();
    savedRef.current = false;

    const flush = () => {
      if (savedRef.current) return;
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      // Ignore bounces under 2s and absurd values over 1 hour on a single view
      if (seconds < 2 || seconds > 3600) return;
      savedRef.current = true;
      base44.entities.Listing.get(listing.id).then(fresh => {
        const totalDwell = (fresh.total_dwell_seconds || 0) + seconds;
        const sessions = (fresh.view_sessions || 0) + 1;
        base44.entities.Listing.update(listing.id, {
          total_dwell_seconds: totalDwell,
          view_sessions: sessions,
        }).catch(() => {});
      }).catch(() => {});
    };

    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [listing?.id]);
}