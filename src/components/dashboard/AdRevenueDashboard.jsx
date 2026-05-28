import React from "react";
import { BarChart2, TrendingUp, DollarSign, Eye, Zap, Info } from "lucide-react";

/**
 * Ad Revenue Dashboard — shows only real factual data.
 * No synthetic stats. Data reflects actual ad network codes deployed in index.html.
 */

const AD_NETWORKS = [
  {
    id: "elementary_whole",
    name: "Elementary Whole",
    domain: "elementarywhole.com",
    color: "#7c3aed",
    status: "active",
    scriptType: "Async banner / pop",
    notes: "Injected via delayed script after 7s page load",
  },
  {
    id: "prickly",
    name: "Prickly Association",
    domain: "pricklyassociation.com",
    color: "#ec4899",
    status: "active",
    scriptType: "Inline push / interstitial",
    notes: "Injected via delayed script after 7s page load",
  },
  {
    id: "quge5",
    name: "Quge5",
    domain: "quge5.com",
    status: "active",
    color: "#f59e0b",
    scriptType: "Tag zone #243750",
    notes: "Injected via delayed script after 7s page load",
  },
  {
    id: "monetag",
    name: "Monetag",
    domain: "monetag.com",
    status: "meta_only",
    color: "#10b981",
    scriptType: "Meta verification",
    notes: "Verification meta tag only — push/banner pending setup",
  },
];

export default function AdRevenueDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-black text-xl flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-purple-400" /> Ad Revenue Dashboard
        </h2>
        <p className="text-gray-400 text-sm mt-0.5">Overview of active ad networks deployed on the website</p>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-300 font-semibold text-sm">Real Data Only</p>
          <p className="text-blue-400/80 text-xs mt-0.5">
            Revenue, impressions and click stats are available directly in each ad network's publisher dashboard.
            This page shows the active script configuration. Connect to each network's API for live metrics.
          </p>
        </div>
      </div>

      {/* Active Networks */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-bold">Deployed Ad Networks</h3>
          <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {AD_NETWORKS.filter(n => n.status === "active").length} Active
          </span>
        </div>
        <div className="divide-y divide-gray-800">
          {AD_NETWORKS.map((n) => (
            <div key={n.id} className="p-4 flex items-start gap-4 hover:bg-gray-800/30 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${n.color}22`, border: `1px solid ${n.color}44` }}>
                <span className="w-3 h-3 rounded-full" style={{ background: n.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-bold text-sm">{n.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${n.status === "active" ? "bg-green-900/40 text-green-400 border border-green-700/40" : "bg-yellow-900/40 text-yellow-400 border border-yellow-700/40"}`}>
                    {n.status === "active" ? "ACTIVE" : "PARTIAL"}
                  </span>
                </div>
                <p className="text-gray-500 text-xs font-mono mt-0.5">{n.domain}</p>
                <p className="text-gray-400 text-xs mt-1">Type: {n.scriptType}</p>
                <p className="text-gray-600 text-xs mt-0.5 italic">{n.notes}</p>
              </div>
              <a
                href={`https://${n.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 underline flex-shrink-0"
              >
                Dashboard ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Admin protection notice */}
      <div className="flex items-start gap-3 bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
        <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <p className="text-purple-300 font-semibold text-sm">Admin Ad Protection Active</p>
          <p className="text-purple-400/80 text-xs mt-0.5">
            All ad scripts are blocked when an admin account is detected. Ads load with a 7-second delay for regular visitors only.
          </p>
        </div>
      </div>

      {/* Revenue tracking guidance */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" /> Where to Check Real Revenue Stats
        </h4>
        <div className="space-y-2">
          {[
            { name: "Elementary Whole", url: "https://elementarywhole.com", desc: "Login → Publisher Stats" },
            { name: "Prickly Association", url: "https://pricklyassociation.com", desc: "Login → Revenue Dashboard" },
            { name: "Quge5", url: "https://quge5.com", desc: "Login → Zone #243750 Analytics" },
            { name: "Monetag", url: "https://monetag.com", desc: "Login → Publisher Panel" },
          ].map(n => (
            <div key={n.name} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div>
                <p className="text-white text-xs font-semibold">{n.name}</p>
                <p className="text-gray-500 text-xs">{n.desc}</p>
              </div>
              <a href={n.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
                Open ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}