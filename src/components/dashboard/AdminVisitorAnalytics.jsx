import React, { useState, useEffect } from "react";
import { Globe, Eye, Users, TrendingUp, MapPin, Monitor } from "lucide-react";
import { base44 } from "@/api/base44Client";

function pickField(record, names) {
  for (const name of names) {
    if (record?.[name] !== undefined && record?.[name] !== null && record?.[name] !== "") return record[name];
  }
  return null;
}

export default function AdminVisitorAnalytics() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    base44.entities.SiteAnalytics.list("-date", 90)
      .then(data => { setAnalytics(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const periodData = {
    "7d": analytics.slice(0, 7),
    "30d": analytics.slice(0, 30),
    "90d": analytics,
  };

  const data = periodData[period] || [];
  const totalViews = data.reduce((s, d) => s + (Number(d.page_views) || 0), 0);
  const totalUnique = data.reduce((s, d) => s + (Number(d.unique_visitors) || 0), 0);
  const totalReg = data.reduce((s, d) => s + (Number(d.new_registrations) || 0), 0);

  const countryMap = data.reduce((acc, item) => {
    const country = pickField(item, ["country", "country_name", "ip_country", "visitor_country"]);
    if (!country) return acc;
    const views = Number(item.page_views) || Number(item.visitors) || Number(item.unique_visitors) || 1;
    acc[country] = (acc[country] || 0) + views;
    return acc;
  }, {});
  const countryData = Object.entries(countryMap)
    .map(([country, visitors]) => ({ country, visitors, pct: totalViews ? Math.round((visitors / totalViews) * 100) : 0 }))
    .sort((a, b) => b.visitors - a.visitors);

  const deviceMap = data.reduce((acc, item) => {
    const device = pickField(item, ["device_type", "device", "platform"]);
    if (!device) return acc;
    const views = Number(item.page_views) || Number(item.visitors) || Number(item.unique_visitors) || 1;
    acc[device] = (acc[device] || 0) + views;
    return acc;
  }, {});
  const deviceData = Object.entries(deviceMap)
    .map(([label, visitors]) => ({ label, visitors, pct: totalViews ? Math.round((visitors / totalViews) * 100) : 0 }))
    .sort((a, b) => b.visitors - a.visitors);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-white font-black text-xl flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-400" /> Visitor Analytics
          </h2>
          <p className="text-gray-500 text-xs mt-1">Only stored realtime tracking records are shown. No estimated country or device data.</p>
        </div>
        <div className="flex gap-2">
          {["7d","30d","90d"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${period === p ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Tracked Page Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
          { label: "Tracked Unique Visitors", value: totalUnique.toLocaleString(), icon: Users, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
          { label: "New Registrations", value: totalReg.toLocaleString(), icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-4 border ${s.bg}`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {data.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> Daily Page Views
          </h3>
          <div className="flex items-end gap-1 h-24">
            {[...data].reverse().map((d, i) => {
              const max = Math.max(...data.map(x => Number(x.page_views) || 0), 1);
              const pct = ((Number(d.page_views) || 0) / max) * 100;
              return (
                <div key={d.id || i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex items-end h-20">
                    <div className="w-full bg-purple-600/30 rounded-t hover:bg-purple-500/60 transition-colors cursor-default shadow-[0_0_16px_rgba(124,58,237,0.35)]"
                      style={{ height: `${Math.max(pct, 4)}%`, minHeight: 4 }}
                      title={`${d.date || d.created_date}: ${Number(d.page_views) || 0} views`}
                    />
                  </div>
                  {i % Math.ceil(data.length / 7) === 0 && (
                    <span className="text-gray-600 text-[9px] rotate-45 origin-left whitespace-nowrap">{(d.date || d.created_date || "").slice(5, 10)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pink-400" /> Visitors by Country
          </h3>
          {countryData.length === 0 ? (
            <p className="text-gray-500 text-sm py-10 text-center">No country/IP country fields are stored yet.</p>
          ) : (
            <div className="space-y-3">
              {countryData.map((n) => (
                <div key={n.country}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-semibold">{n.country}</span>
                    <span className="text-gray-400 text-xs">{n.visitors.toLocaleString()} · {n.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${Math.max(n.pct, 2)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-400" /> Device Breakdown
          </h3>
          {deviceData.length === 0 ? (
            <p className="text-gray-500 text-sm py-10 text-center">No device fields are stored yet.</p>
          ) : (
            <div className="space-y-3">
              {deviceData.map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white text-sm capitalize">{d.label}</span>
                    <span className="text-gray-400 text-sm font-bold">{d.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.max(d.pct, 2)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}