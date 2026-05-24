import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { DollarSign, TrendingUp, Package, Users, BarChart2 } from "lucide-react";

export default function AdminTransactionsDashboard({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalFees: 0,
    totalPayouts: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const allTransactions = await base44.entities.GlobalTransactions.list("-transaction_date", 100);
        setTransactions(allTransactions);

        const totalRevenue = allTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
        const totalFees = allTransactions.reduce((sum, t) => sum + (t.admin_fee || 0), 0);
        const totalPayouts = allTransactions.reduce((sum, t) => sum + (t.seller_payout || 0), 0);

        setStats({
          totalRevenue,
          totalFees,
          totalPayouts,
          transactionCount: allTransactions.length,
        });
      } catch (e) {
        console.error("Failed to load transactions:", e);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₱${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
          { label: "Platform Fees", value: `₱${stats.totalFees.toLocaleString()}`, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
          { label: "Seller Payouts", value: `₱${stats.totalPayouts.toLocaleString()}`, icon: Package, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
          { label: "Transactions", value: stats.transactionCount, icon: BarChart2, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl p-4 border ${s.bg}`}
          >
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-white font-bold text-lg">Global Transactions</h3>
        </div>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  {["Date", "Order ID", "Buyer", "Seller", "Total", "Fee", "Payout", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((t) => (
                  <tr key={t.id} className="border-t border-gray-800">
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(t.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white text-xs font-mono">{t.order_id?.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{t.buyer_email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{t.seller_email}</td>
                    <td className="px-4 py-3 text-green-400 font-bold">₱{t.total_amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-blue-400 font-bold">₱{t.admin_fee?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-purple-400 font-bold">₱{t.seller_payout?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.payment_status === "completed" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"
                      }`}>
                        {t.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}