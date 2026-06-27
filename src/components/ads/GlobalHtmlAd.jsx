import React, { useEffect, useRef, useState } from "react";
import { X, Megaphone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";

const AD_DELAY_MS = 5 * 60 * 1000; // 5 minutes after the user first visits
const SETTINGS_KEY = "html_ad";

// Injects raw HTML/JS ad code (scripts re-created so they actually execute).
function AdHtml({ html }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html;
    el.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      [...old.attributes].forEach((a) => s.setAttribute(a.name, a.value));
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
  }, [html]);
  return <div ref={ref} />;
}

export default function GlobalHtmlAd() {
  const [ad, setAd] = useState(null);
  const [show, setShow] = useState(false);
  const [exempt, setExempt] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setIsMobileViewport(media.matches);
    onChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  // Ad-free option bans ALL ad codes for the user (admin-set no_ads,
  // account moderators, and admins never see ad codes).
  useEffect(() => {
    base44.auth.me().then((me) => {
      if (!me) return;
      if (isAdmin(me.email)) { setExempt(true); return; }
      base44.entities.UserProfile.filter({ user_email: me.email }).then((p) => {
        const prof = p[0];
        if (prof && (prof.no_ads === true || prof.moderator_type === "account_moderator")) setExempt(true);
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (exempt) return;
    base44.entities.SiteSettings.filter({ key: SETTINGS_KEY })
      .then((rows) => {
        const row = rows?.[0];
        // Respect the admin ban flag and require actual ad code.
        if (row && row.ad_enabled !== false && row.ad_html_code) setAd(row);
      })
      .catch(() => {});
  }, [exempt]);

  useEffect(() => {
    if (!ad || exempt) return;
    const timer = setTimeout(() => setShow(true), AD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ad]);

  if (!ad || !show || exempt || isMobileViewport) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-black/70">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-pink-500/40 bg-gray-950 shadow-[0_0_50px_rgba(236,72,153,.35)]">
        <button onClick={() => setShow(false)} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/10 text-white flex items-center justify-center">
          <X className="w-4 h-4" />
        </button>
        <div className="px-5 pt-5">
          <p className="text-pink-300 text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2"><Megaphone className="w-3.5 h-3.5" /> Sponsored</p>
        </div>
        <div className="p-5">
          <AdHtml html={ad.ad_html_code} />
        </div>
      </div>
    </div>
  );
}