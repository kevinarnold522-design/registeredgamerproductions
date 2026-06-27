import React, { useState, useEffect, useRef } from "react";
import { Bell, ShoppingCart, DollarSign, Download, MessageCircle, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!userEmail) return;
    base44.entities.Notification.filter({ user_email: userEmail }, "-created_date", 20)
      .then(n => setNotifications(Array.isArray(n) ? n : []))
      .catch(() => setNotifications([]));
  }, [userEmail]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    const unreadItems = notifications.filter(n => !n.is_read);
    await Promise.all(unreadItems.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const typeIcon = {
    order: <ShoppingCart className="w-4 h-4 text-blue-300" />,
    sale: <DollarSign className="w-4 h-4 text-blue-300" />,
    download: <Download className="w-4 h-4 text-blue-300" />,
    message: <MessageCircle className="w-4 h-4 text-blue-300" />,
    system: <Info className="w-4 h-4 text-blue-300" />,
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-950/30 border border-blue-800/50 hover:border-blue-500/70 transition-colors"
        >
        <Bell className="w-4 h-4 text-blue-300" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-600 text-white text-[9px] flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="absolute right-0 top-full mt-2 z-50 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h4 className="text-white font-black text-sm">Notifications</h4>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-purple-400 text-xs font-semibold hover:text-purple-300 transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800/60 hover:bg-gray-800/50 transition-colors cursor-default ${!n.is_read ? "bg-purple-900/10" : ""}`}
                      onClick={async () => {
                        if (!n.is_read) {
                          await base44.entities.Notification.update(n.id, { is_read: true });
                          setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
                        }
                        if (n.link) window.location.href = n.link;
                      }}
                    >
                      <span className="mt-0.5">{typeIcon[n.type] || <Bell className="w-4 h-4 text-blue-300" />}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold leading-tight ${n.is_read ? "text-gray-300" : "text-white"}`}>{n.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-gray-600 text-[10px] mt-1">{new Date(n.created_date).toLocaleString()}</p>
                      </div>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 shrink-0" />}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}