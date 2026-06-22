import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, X, Heart, MessageCircle, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PostNotifications({ user, franchiseId }) {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !franchiseId) return;

    // Subscribe to new posts in real-time
    const unsubscribe = base44.entities.CommunityPost.subscribe((event) => {
      if (event.type === "create" && event.data.franchise_id === franchiseId) {
        // Don't notify for own posts
        if (event.data.author_email !== user.email) {
          addNotification({
            type: "new_post",
            title: "New Post Alert! 🎮",
            message: `${event.data.author_username} just posted in the community`,
            data: event.data,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [user, franchiseId]);

  const addNotification = (notif) => {
    const id = Date.now();
    const newNotif = { ...notif, id, timestamp: new Date().toISOString(), read: false };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    setUnreadCount(c => c + 1);
    
    // Show browser notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notif.title, {
        body: notif.message,
        icon: "/favicon.ico"
      });
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setShowPanel(v => !v)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-purple-400 hover:border-purple-500/50 transition-all"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-purple-400 animate-pulse" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        <span className="text-xs font-semibold">Updates</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-gray-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-[500px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <p className="text-white font-bold text-sm">Notifications</p>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 rounded-lg hover:bg-purple-900/20 transition-colors">
                    Mark all read
                  </button>
                )}
                <button onClick={clearAll} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm font-semibold">No notifications yet</p>
                  <p className="text-gray-700 text-xs mt-1">Stay tuned for community updates!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      notif.read 
                        ? "bg-gray-800/30 border-gray-800" 
                        : "bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-700/30"
                    } hover:border-purple-500/50 hover:bg-purple-900/30`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        notif.type === "new_post" ? "bg-purple-600/20" : "bg-blue-600/20"
                      }`}>
                        {notif.type === "new_post" ? (
                          <MessageCircle className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Heart className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-xs">{notif.title}</p>
                        <p className="text-gray-400 text-[10px] mt-0.5">{notif.message}</p>
                        <p className="text-gray-600 text-[9px] mt-1">
                          {new Date(notif.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}