import React, { useEffect, useMemo, useState } from "react";
import { Clock, Search, Shield, UserCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function AdminUserLogs({ users = [] }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    base44.entities.LoginHistory.list("-login_date", 500)
      .then((items) => setLogs(items || []))
      .finally(() => setLoading(false));
  }, []);

  const userByEmail = useMemo(() => {
    const map = {};
    users.forEach((user) => { if (user.user_email) map[user.user_email] = user; });
    return map;
  }, [users]);

  const latestByEmail = useMemo(() => {
    const map = {};
    logs.forEach((log) => {
      if (!log.user_email) return;
      if (!map[log.user_email] || new Date(log.login_date) > new Date(map[log.user_email].login_date)) {
        map[log.user_email] = log;
      }
    });
    return map;
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    const user = userByEmail[log.user_email];
    const haystack = `${log.user_email || ""} ${user?.username || ""} ${log.ip_address || ""} ${log.device_type || ""} ${log.browser || ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-white font-black text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-yellow-400" /> User Login Logs
          </h3>
          <p className="text-gray-500 text-xs mt-1">Admin view of each user’s recorded login timestamps, device, browser, and IP address.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 min-w-[260px]">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search user, IP, device..."
            className="bg-transparent outline-none text-white text-sm placeholder-gray-600 flex-1"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
          <UserCheck className="w-5 h-5 text-purple-300 mb-2" />
          <p className="text-gray-400 text-xs">Users with Logs</p>
          <p className="text-purple-300 text-2xl font-black">{Object.keys(latestByEmail).length}</p>
        </div>
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
          <Clock className="w-5 h-5 text-blue-300 mb-2" />
          <p className="text-gray-400 text-xs">Total Login Records</p>
          <p className="text-blue-300 text-2xl font-black">{logs.length}</p>
        </div>
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
          <Clock className="w-5 h-5 text-green-300 mb-2" />
          <p className="text-gray-400 text-xs">Latest Login</p>
          <p className="text-green-300 text-sm font-black">{formatDate(logs[0]?.login_date)}</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h4 className="text-white font-bold">Latest Login by User</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                {["User", "Email", "Last Login", "IP Address", "Device", "Browser", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const latest = latestByEmail[user.user_email];
                return (
                  <tr key={user.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-white text-xs font-bold">{user.username || user.display_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{user.user_email}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{formatDate(latest?.login_date)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{latest?.ip_address || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs capitalize">{latest?.device_type || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{latest?.browser || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${latest?.success === false ? "bg-red-900/40 text-red-300" : latest ? "bg-green-900/40 text-green-300" : "bg-gray-800 text-gray-500"}`}>
                        {latest?.success === false ? "Failed" : latest ? "Success" : "No log"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h4 className="text-white font-bold">All Login Timestamps</h4>
        </div>
        <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Loading login logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No login logs found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 sticky top-0">
                <tr>
                  {["Timestamp", "User", "Email", "IP", "Device", "Browser", "Location"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const user = userByEmail[log.user_email];
                  return (
                    <tr key={log.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">{formatDate(log.login_date)}</td>
                      <td className="px-4 py-3 text-white text-xs font-bold">{user?.username || "—"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{log.user_email}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{log.ip_address || "—"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs capitalize">{log.device_type || "—"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{log.browser || "—"}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{log.location || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}