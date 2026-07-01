import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function VisitorCountryTracker() {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      if (window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(pointer: coarse)").matches) {
        return;
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const key = `country_visit_logged_${today}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const track = async () => {
      const res = await fetch("/functions/api/geo", { headers: { Accept: "application/json" } }).catch(() => null);
      const contentType = res?.headers?.get?.("content-type") || "";
      if (!res?.ok || !contentType.includes("application/json")) return;
      const geo = await res.json().catch(() => null);
      const country = geo?.countryName || geo?.country || geo?.countryCode || "Unknown";
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

    const handle = typeof window !== "undefined" && typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(() => track().catch(() => {}), { timeout: 4000 })
      : setTimeout(() => track().catch(() => {}), 1200);

    return () => {
      if (typeof window !== "undefined" && typeof window.cancelIdleCallback === "function" && typeof handle === "number") {
        window.cancelIdleCallback(handle);
        return;
      }
      clearTimeout(handle);
    };
  }, []);

  return null;
}