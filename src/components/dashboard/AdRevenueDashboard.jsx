import React, { useState } from "react";
import { BarChart2, TrendingUp, DollarSign, Eye, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const AD_NETWORKS = [
  {
    id: "elementary_whole",
    name: "Elementary Whole",
    domain: "elementarywhole.com",
    color: "#7c3aed",
    impressions: 12400,
    clicks: 310,
    revenue: 4.28,
    status: "active",
  },
  {
    id: "prickly",
    name: "Prickly Association",
    domain: "pricklyassociation.com",
    color: "#ec4899",
    impressions: 9800,
    clicks: 218,
    revenue: 2.91,
    status: "active",
  },
  {
    id: "quge5",
    name: "Quge5",
    domain: "quge5.com",
    color: "#f59e0b",
    impressions: 7200,
    clicks: 144,
    revenue: 1.62,
    status: "active",
  },
  {
    id: "monetag",
    name: "Monetag",
    domain: "monetag.com",
    color: "#10b981",
    impressions: 5500,
    clicks: 88,
    revenue: 1.05,
    status: "active",
  },
];

const DAILY_DATA = [
  { day: "Mon", elementary: 0.62, prickly: 0.41, quge: 0.24, monetag: 0.15 },
  { day: "Tue", elementary: 0.58, prickly: 0.38, quge: 0.21, monetag: 0.13 },
  { day: "Wed", elementary: 0.71, prickly: 0.45, quge: 0.28, monetag: 0.17 },
  { day: "Thu", elementary: 0.65, prickly: 0.42, quge: 0.25, monetag: 0.16 },
  { day: "Fri", elementary: 0.80, prickly: 0.52, quge: 0.31, monetag: 0.20 },
  { day: "Sat", elementary: 0.94, prickly: 0.61, quge: 0.38, monetag: 0.24 },
  { day: "Sun", elementary: 0.98, prickly: 0.63, quge: 0.35, monetag: 0.20 },
];

const PIE_COLORS = ["#7c3aed", "#ec4899", "#f59e0b", "#10b981"];

export default function AdRevenueDashboard() {
  const [period, setPeriod] = useState("week");

  const totalRevenue = AD_NETWORKS.reduce((s, n) => s + n.revenue, 0);
  const totalImpressions = AD_NETWORKS.reduce((s, n) => s + n.impressions, 0);
  const totalClicks = AD_NETWORKS.reduce((s, n) => s + n.clicks, 0);
  const avgCTR = ((totalClicks / totalImpressions) * 100).toFixed(2);

  const pieData = AD_NETWORKS.map(n => ({ name: n.name, value: n.revenue }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-black text-xl flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-400" /> Ad Revenue Dashboard
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">Track which ad network is generating the most revenue</p>
        </div>
        <div className="flex gap-2">
          {["week", "month"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${period === p ? "bg-purple-600 text-white" : "bg-gray-800 border border-gray-700 text-gray-400"}`}>
              {p === "week" ? "7 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
          { label: "Impressions", value: totalImpressions.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
          { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
          { label: "Avg CTR", value: `${avgCTR}%`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-4 border ${s.bg}`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top Networks Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-bold">Ad Networks Performance</h3>
          <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                {["Network", "Domain", "Impressions", "Clicks", "CTR", "Revenue", "Rank"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...AD_NETWORKS].sort((a, b) => b.revenue - a.revenue).map((n, i) => {
                const ctr = ((n.clicks / n.impressions) * 100).toFixed(2);
                return (
                  <tr key={n.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: n.color }} />
                        <span className="text-white font-bold text-xs">{n.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{n.domain}</td>
                    <td className="px-4 py-3 text-blue-400 font-bold text-xs">{n.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-yellow-400 font-bold text-xs">{n.clicks}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{ctr}%</td>
                    <td className="px-4 py-3 text-green-400 font-black text-xs">${n.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${i === 0 ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" : i === 1 ? "bg-gray-700 text-gray-300" : "bg-gray-800 text-gray-500"}`}>
                        #{i + 1}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar chart daily */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h4 className="text-white font-bold text-sm mb-4">Daily Revenue by Network ($)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DAILY_DATA}>
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
              <Bar dataKey="elementary" name="Elementary" fill="#7c3aed" radius={[3, 3, 0, 0]} />
              <Bar dataKey="prickly" name="Prickly" fill="#ec4899" radius={[3, 3, 0, 0]} />
              <Bar dataKey="quge" name="Quge5" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="monetag" name="Monetag" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart revenue share */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h4 className="text-white font-bold text-sm mb-4">Revenue Share by Network</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                labelLine={false} style={{ fontSize: 10 }}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {AD_NETWORKS.map((n, i) => (
              <div key={n.id} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                {n.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Performer Highlight */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-700/40 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-purple-300" />
        </div>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Top Performing Network</p>
          <p className="text-white font-black text-lg">Elementary Whole</p>
          <p className="text-purple-300 text-sm">$4.28 revenue · 12,400 impressions · 2.50% CTR this week</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-green-400 font-black text-2xl">$4.28</p>
          <p className="text-gray-500 text-xs">this week</p>
        </div>
      </div>
    </div>
  );
}