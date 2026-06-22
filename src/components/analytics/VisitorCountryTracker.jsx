import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function VisitorCountryTracker() {
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `country_visit_logged_${today}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const track = async () => {
      const res = await fetch("https://ipapi.co/json/");
      const geo = await res.json();
      const country = geo?.country_name || geo?.country || "Unknown";
      const rows = await base44.entities.SiteAnalytics.filter({ date: today });
      const current = rows[0];
      const countries = { ...(current?.countries || {}) };
      countries[country] = (Number(countries[country]) || 0) + 1;
      if (current) {
        await base44.entities.SiteAnalytics.update(current.id, {
          countries,
          page_views: (Number(current.page_views) || 0) + 1,
          unique_visitors: (Number(current.unique_visitors) || 0) + 1,
        });
      } else {
        await base44.entities.SiteAnalytics.create({
          date: today,
          countries,
          page_views: 1,
          unique_visitors: 1,
          description: `Realtime country visit tracking for ${today}`,
        });
      }
    };

    track().catch(() => {});
  }, []);

  return null;
}