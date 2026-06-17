import React, { useEffect, useState } from "react";
import { X, Megaphone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";

export default function ScheduledAdOverlay({ listing, adsDisabled = false }) {
  const [ads, setAds] = useState([]);
  const [activeAd, setActiveAd] = useState(null);
  const [exempt, setExempt] = useState(adsDisabled);

  // Permanently block all ads for ad-free users (admin-controlled no_ads, account moderators, admins)
  useEffect(() => {
    if (adsDisabled) { setExempt(true); return; }
    base44.auth.me().then(me => {
      if (!me) return;
      if (isAdmin(me.email)) { setExempt(true); return; }
      base44.entities.UserProfile.filter({ user_email: me.email }).then(p => {
        const prof = p[0];
        if (prof && (prof.no_ads === true || prof.moderator_type === "account_moderator")) setExempt(true);
      }).catch(() => {});
    }).catch(() => {});
  }, [adsDisabled]);

  useEffect(() => {
    if (!listing || exempt) return;
    base44.entities.AdPlacement.filter({ is_active: true }).then(rows => {
      setAds(rows.filter(ad =>
        ad.page_type === "global" ||
        (ad.page_type === "listing" && ad.listing_id === listing.id) ||
        (ad.page_type === "category" && ad.category === listing.category)
      ));
    });
  }, [listing?.id, exempt]);

  useEffect(() => {
    if (ads.length === 0 || exempt) return;
    const timers = [];
    ads.forEach((ad, index) => {
      const delay = ((Number(ad.start_delay_seconds) || 0) + index * 2) * 1000;
      const duration = (Number(ad.duration_seconds) || 10) * 1000;
      const interval = Math.max(Number(ad.interval_seconds) || 120, 20) * 1000;
      const show = () => {
        setActiveAd(ad);
        timers.push(setTimeout(() => setActiveAd(current => current?.id === ad.id ? null : current), duration));
      };
      timers.push(setTimeout(() => {
        show();
        timers.push(setInterval(show, interval));
      }, delay));
    });
    return () => timers.forEach(clearTimeout);
  }, [ads]);

  if (!activeAd || exempt) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-pink-500/40 bg-gray-950 shadow-[0_0_50px_rgba(236,72,153,.35)]">
        <button onClick={() => setActiveAd(null)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
        {activeAd.image_url && <img src={activeAd.image_url} alt="" className="w-full h-44 object-cover" />}
        <div className="p-5">
          <p className="text-pink-300 text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2"><Megaphone className="w-3.5 h-3.5" /> Sponsored</p>
          <h3 className="text-white text-2xl font-black mt-2">{activeAd.title}</h3>
          {activeAd.body && <p className="text-gray-400 text-sm mt-2">{activeAd.body}</p>}
          {activeAd.cta_url && <a href={activeAd.cta_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-black">{activeAd.cta_label || "Open"}</a>}
        </div>
      </div>
    </div>
  );
}