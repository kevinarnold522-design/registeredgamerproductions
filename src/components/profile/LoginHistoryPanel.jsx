import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Monitor, Smartphone, Tablet, Globe, CheckCircle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LoginHistoryPanel({ userEmail }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    base44.entities.LoginHistory.filter({ user_email: userEmail }, "-login_date", 50)
      .then(h => {
        setHistory(h);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userEmail]);

  const getDeviceIcon = (type) => {
    if (type === "mobile") return <Smartphone className="w-4 h-4" />;
    if (type === "tablet") return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", { 
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Loading login history...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-bold text-sm">Login History</h3>
      </div>

      <div className="divide-y divide-gray-800">
        {history.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No login history found
          </div>
        ) : (
          history.map((login, i) => (
            <div key={login.id || i} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${login.success ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                {login.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs font-semibold flex items-center gap-1">
                    {getDeviceIcon(login.device_type)}
                    {login.device_type}
                  </span>
                  <span className="text-gray-500 text-[10px] px-1.5 py-0.5 rounded bg-gray-800">
                    {login.browser}
                  </span>
                </div>
                <p className="text-gray-400 text-[10px] mt-0.5 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  {login.ip_address} • {login.location || "Unknown"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-gray-300 text-xs font-medium">{formatDate(login.login_date)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}