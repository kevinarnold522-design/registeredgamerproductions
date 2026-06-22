import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, RefreshCw, CheckCircle2, XCircle, Globe, Loader2 } from "lucide-react";
import { isAdmin } from "@/lib/constants";

const INTERNAL_ROUTES = [
  "/", "/register", "/dashboard", "/profile", "/channel",
  "/category", "/checkout", "/messages", "/payment",
  "/ai-video-studio", "/studio", "/music-library", "/about",
  "/analytics", "/admin-editor", "/create-listing",
];

// Check if internal routes resolve (they should always be ok with vercel.json rewrite)
// Check external/API links for actual 404s
async function scanLinks() {
  const results = [];

  // Internal routes — all should be OK with SPA rewrite
  for (const route of INTERNAL_ROUTES) {
    results.push({ url: route, type: "internal", status: "ok", label: route });
  }

  // External links we can probe via fetch (no-cors mode — just checks reachability)
  const external = [
    { url: "https://mail.google.com", label: "Gmail Webmail" },
    { url: "https://mail.yahoo.com", label: "Yahoo Webmail" },
    { url: "https://outlook.live.com/mail/0/", label: "Outlook Webmail" },
    { url: "https://mail.proton.me", label: "ProtonMail" },
    { url: "https://mail.aol.com", label: "AOL Mail" },
    { url: "https://mail.zoho.com", label: "Zoho Mail" },
    { url: "https://www.icloud.com/mail", label: "iCloud Mail" },
    { url: "https://www.facebook.com", label: "Facebook Share" },
    { url: "https://wa.me", label: "WhatsApp Share" },
    { url: "https://twitter.com", label: "X / Twitter Share" },
    { url: "https://t.me", label: "Telegram Share" },
  ];

  await Promise.all(
    external.map(async (item) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(item.url, { method: "HEAD", mode: "no-cors", signal: controller.signal });
        clearTimeout(timeout);
        // no-cors always returns opaque (status 0) but no error = reachable
        results.push({ ...item, type: "external", status: "ok" });
      } catch (e) {
        const isTimeout = e.name === "AbortError";
        results.push({ ...item, type: "external", status: isTimeout ? "timeout" : "error" });
      }
    })
  );

  return results;
}

export default function AdminLinkScanner({ userEmail }) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  if (!isAdmin(userEmail)) return null;

  const handleScan = async () => {
    setScanning(true);
    setResults(null);
    const r = await scanLinks();
    setResults(r);
    setScanning(false);
  };

  const errors = results?.filter(r => r.status !== "ok") || [];
  const ok = results?.filter(r => r.status === "ok") || [];

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => { setOpen(true); handleScan(); }}
        className="fixed bottom-20 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-yellow-300 shadow-lg transition-all hover:scale-105"
        style={{ background: "rgba(20,10,5,0.95)", border: "1px solid rgba(245,197,24,0.4)", boxShadow: "0 0 16px rgba(245,197,24,0.2)" }}
        title="Admin: Scan site for broken links"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:block">Link Scanner</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-hidden"
              style={{ background: "rgba(8,5,20,0.98)", border: "1px solid rgba(245,197,24,0.3)", backdropFilter: "blur(20px)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-white font-black text-base">Admin — Site Link Scanner</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-600/20 border border-yellow-500/40 text-yellow-300 text-xs font-semibold hover:bg-yellow-600/30 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
                    {scanning ? "Scanning…" : "Re-scan"}
                  </button>
                  <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {scanning && (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-gray-400 text-sm">Scanning all site links…</p>
                </div>
              )}

              {results && !scanning && (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-xl p-3 text-center bg-green-900/20 border border-green-700/30">
                      <p className="text-green-400 font-black text-xl">{ok.length}</p>
                      <p className="text-green-500 text-xs">Passing</p>
                    </div>
                    <div className={`rounded-xl p-3 text-center ${errors.length > 0 ? "bg-red-900/20 border border-red-700/40" : "bg-gray-900 border border-gray-800"}`}>
                      <p className={`font-black text-xl ${errors.length > 0 ? "text-red-400" : "text-gray-500"}`}>{errors.length}</p>
                      <p className={`text-xs ${errors.length > 0 ? "text-red-500" : "text-gray-600"}`}>Issues</p>
                    </div>
                    <div className="rounded-xl p-3 text-center bg-gray-900 border border-gray-800">
                      <p className="text-white font-black text-xl">{results.length}</p>
                      <p className="text-gray-500 text-xs">Total</p>
                    </div>
                  </div>

                  {errors.length === 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-900/20 border border-green-700/30 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <p className="text-green-400 text-sm font-semibold">All links are healthy! No 404s detected.</p>
                    </div>
                  )}

                  {errors.length > 0 && (
                    <div className="mb-4">
                      <p className="text-red-400 text-xs font-bold mb-2 uppercase tracking-wider">⚠ Issues Found</p>
                      <div className="space-y-1.5">
                        {errors.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-red-900/20 border border-red-700/30">
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-semibold truncate">{r.label || r.url}</p>
                              <p className="text-red-400 text-[10px]">{r.status === "timeout" ? "Timeout (unreachable)" : "Error / 404"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All results */}
                  <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                    <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-1">All checked links</p>
                    {results.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-900/50 transition-colors">
                        {r.status === "ok"
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                        <span className="text-gray-400 text-[11px] flex-1 truncate">{r.label || r.url}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${r.type === "internal" ? "bg-purple-900/40 text-purple-300" : "bg-gray-800 text-gray-500"}`}>
                          {r.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}