import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, DollarSign, Package, Download, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SalesDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [o, l] = await Promise.all([
        base44.entities.Order.filter({ seller_email: user.email }),
        base44.entities.Listing.filter({ seller_email: user.email }),
      ]);
      setOrders(o);
      setListings(l);
      setLoading(false);
    };
    load();
  }, [user.email]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  const paidOrders = orders.filter(o => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.seller_payout || 0), 0);
  const totalSales = paidOrders.length;
  const totalDownloads = listings.reduce((s, l) => s + (l.views || 0), 0);

  // Sales by listing
  const salesByListing = listings.map(l => {
    const listingSales = paidOrders.filter(o => o.listing_id === l.id);
    return {
      name: l.title?.length > 18 ? l.title.substring(0, 18) + "..." : l.title,
      sales: listingSales.length,
      revenue: listingSales.reduce((s, o) => s + (o.seller_payout || 0), 0),
    };
  }).filter(l => l.sales > 0).sort((a, b) => b.sales - a.sales);

  // Sales by month (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toLocaleString("default", { month: "short" });
    const monthOrders = paidOrders.filter(o => {
      const od = new Date(o.created_date);
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
    });
    monthlyData.push({ month: monthKey, sales: monthOrders.length, revenue: monthOrders.reduce((s, o) => s + (o.seller_payout || 0), 0) });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-white font-black text-xl flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-purple-400" /> Sales Dashboard
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
          { label: "Total Sales", value: totalSales, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
          { label: "Active Listings", value: listings.filter(l => l.status === "active").length, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
          { label: "Total Downloads", value: totalDownloads.toLocaleString(), icon: Download, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-4 border ${s.bg}`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <h3 className="text-white font-bold mb-4">Monthly Revenue ($)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 12 }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#a855f7" }} />
            <Bar dataKey="revenue" fill="#a855f7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Selling Listings */}
      {salesByListing.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold">Top Selling Listings</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>{["Listing", "Sales", "Revenue"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
            </thead>
            <tbody>
              {salesByListing.slice(0, 10).map((l, i) => (
                <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white text-xs font-medium">{l.name}</td>
                  <td className="px-4 py-3 text-blue-400 font-bold">{l.sales}</td>
                  <td className="px-4 py-3 text-green-400 font-bold">${l.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All listings with sales count */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">All Listings Performance</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50">
            <tr>{["Title", "Price", "Downloads/Views", "Sales", "Revenue"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
          </thead>
          <tbody>
            {listings.map(l => {
              const listingSales = paidOrders.filter(o => o.listing_id === l.id).length;
              const listingRevenue = paidOrders.filter(o => o.listing_id === l.id).reduce((s, o) => s + (o.seller_payout || 0), 0);
              return (
                <tr key={l.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white text-xs font-medium max-w-[140px] truncate">{l.title}</td>
                  <td className="px-4 py-3 text-purple-400 font-bold">{l.is_free ? "FREE" : `$${l.price?.toLocaleString()}`}</td>
                  <td className="px-4 py-3 text-blue-400 font-bold">{l.views || 0}</td>
                  <td className="px-4 py-3 text-green-400 font-bold">{listingSales}</td>
                  <td className="px-4 py-3 text-yellow-400 font-bold">${listingRevenue.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}