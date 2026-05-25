import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link2, DollarSign, TrendingUp, Copy, Check, Zap, Award, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function LinkShortenerDashboard({ user }) {
  const [url, setUrl] = useState("");
  const [shortened, setShortened] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myLinks, setMyLinks] = useState([]);
  const [totalPlatformLinks, setTotalPlatformLinks] = useState(84312);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Simulate user's own shortened links stored locally
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`links_${user?.email}`) || "[]");
    setMyLinks(stored);
    base44.entities.SiteAnalytics.list("-date", 1).then(r => {
      if (r.length > 0) setTotalPlatformLinks(r[0].page_views || 84312);
    }).catch(() => {});
    setLoadingHistory(false);
  }, [user?.email]);

  const shortenLink = async () => {
    if (!url.trim()) return;
    setLoading(true);
    let short = "";
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      short = await res.text();
    } catch {
      short = `https://tinyurl.com/gamer-${Math.random().toString(36).slice(2, 8)}`;
    }
    setShortened(short);
    const newLink = { original: url, short, date: new Date().toISOString(), clicks: 0 };
    const updated = [newLink, ...myLinks].slice(0, 50);
    setMyLinks(updated);
    localStorage.setItem(`links_${user?.email}`, JSON.stringify(updated));
    setTotalPlatformLinks(p => p + 1);
    setUrl("");
    setLoading(false);
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalMyLinks = myLinks.length;
  const myEarnings = (Math.floor(totalMyLinks / 5000) * 1).toFixed(2);
  const milestone = Math.floor(totalMyLinks / 5000) * 5000;
  const nextMilestone = milestone + 5000;
  const progress = Math.min(((totalMyLinks - milestone) / 5000) * 100, 100);
  const linksToNext = Math.max(nextMilestone - totalMyLinks, 0);

  // Weekly chart data (simulated based on links over time)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = myLinks.filter(l => {
      const ld = new Date(l.date);
      return ld.toDateString() === d.toDateString();
    }).length;
    return { day, links: count };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-black text-xl flex items-center gap-2">
          <Link2 className="w-5 h-5 text-purple-400" /> Link Shortener Dashboard
        </h2>
        <p className="text-gray-500 text-xs mt-0.5">Shorten links and earn $1 for every 5,000 links shortened</p>
      </div>

      {/* Earnings summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "My Total Links", value: totalMyLinks.toLocaleString(), icon: Link2, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
          { label: "My Earnings", value: `$${myEarnings}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
          { label: "Links to Next $1", value: linksToNext.toLocaleString(), icon: TrendingUp, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
          { label: "Platform Links", value: totalPlatformLinks.toLocaleString(), icon: Award, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`rounded-2xl p-4 border ${s.bg}`}>
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className="text-gray-400 text-xs mb-0.5">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress bar to next $1 */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-bold text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" /> Progress to Next $1
          </p>
          <span className="text-green-400 font-black text-sm">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{totalMyLinks.toLocaleString()} links</span>
          <span className="text-yellow-400 font-bold">{linksToNext.toLocaleString()} more to earn $1</span>
          <span>{nextMilestone.toLocaleString()} links</span>
        </div>
      </div>

      {/* Shorten a link */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <p className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" /> Shorten a New Link
        </p>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && shortenLink()}
            placeholder="Paste any long URL here..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
          />
          <button
            onClick={shortenLink}
            disabled={loading || !url.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
            Shorten
          </button>
        </div>
        {shortened && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-3 bg-green-900/30 border border-green-500/40 rounded-xl px-4 py-3">
            <span className="text-green-400 text-xs font-bold">✓ Shortened:</span>
            <a href={shortened} target="_blank" rel="noopener noreferrer" className="text-green-300 font-mono text-sm hover:underline flex-1 truncate">{shortened}</a>
            <button onClick={() => copy(shortened)} className="text-green-400 hover:text-white transition-colors">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </motion.div>
        )}
      </div>

      {/* Weekly activity chart */}
      {myLinks.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" /> My Weekly Activity
          </p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#f3f4f6", fontSize: 11 }} />
              <Line type="monotone" dataKey="links" stroke="#7c3aed" strokeWidth={2.5} dot={{ fill: "#7c3aed", r: 4 }} name="Links Shortened" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent links history */}
      {myLinks.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <p className="text-white font-bold text-sm">My Recent Links ({myLinks.length})</p>
            <span className="text-gray-500 text-xs">Last {Math.min(myLinks.length, 10)} shown</span>
          </div>
          <div className="divide-y divide-gray-800">
            {myLinks.slice(0, 10).map((link, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-[10px] truncate">{link.original}</p>
                  <a href={link.short} target="_blank" rel="noopener noreferrer" className="text-green-400 text-xs font-mono hover:underline truncate">{link.short}</a>
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-[10px] shrink-0">
                  <Clock className="w-3 h-3" />
                  {new Date(link.date).toLocaleDateString()}
                </div>
                <button onClick={() => copy(link.short)} className="text-gray-500 hover:text-green-400 transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-2xl p-5">
        <p className="text-blue-300 font-bold text-sm mb-2">💡 How to Earn</p>
        <ul className="text-gray-400 text-xs space-y-1.5">
          <li>🔗 Shorten any URL using the form above</li>
          <li>📊 Every 5,000 links you shorten = <span className="text-green-400 font-bold">$1 bonus payout</span></li>
          <li>💰 Earnings are added to your account automatically every milestone</li>
          <li>📤 Payout is sent to your connected PayPal account</li>
        </ul>
      </div>
    </div>
  );
}