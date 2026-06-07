import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, ChevronDown, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";

export default function GroupChat({ franchiseId, communityId, user, profile, accentColor = "#7c3aed" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const admin = isAdmin(user?.email);

  // Load messages and subscribe to real-time updates
  useEffect(() => {
    if (!franchiseId) return;
    base44.entities.GroupChatMessage.filter({ franchise_id: franchiseId }, "created_date", 60)
      .then(msgs => {
        const active = msgs.filter(m => !m.is_deleted);
        setMessages(active);
        if (!open) setUnread(active.length > 0 ? Math.min(active.length, 9) : 0);
      });

    const unsub = base44.entities.GroupChatMessage.subscribe((event) => {
      if (event.data?.franchise_id !== franchiseId) return;
      if (event.type === "create" && !event.data?.is_deleted) {
        setMessages(prev => [...prev, event.data]);
        if (!open) setUnread(n => Math.min(n + 1, 9));
      } else if (event.type === "update") {
        setMessages(prev => prev.map(m => m.id === event.id ? event.data : m).filter(m => !m.is_deleted));
      } else if (event.type === "delete") {
        setMessages(prev => prev.filter(m => m.id !== event.id));
      }
    });

    return unsub;
  }, [franchiseId]);

  // Scroll to bottom when opened or new message
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [open, messages.length]);

  const handleSend = async () => {
    if (!text.trim() || !user || sending) return;
    setSending(true);
    await base44.entities.GroupChatMessage.create({
      franchise_id: franchiseId,
      community_id: communityId || franchiseId,
      author_email: user.email,
      author_username: profile?.username || user.full_name || "Gamer",
      author_avatar: profile?.avatar_url || "",
      content: text.trim(),
    });
    setText("");
    setSending(false);
  };

  const handleDelete = async (msgId) => {
    await base44.entities.GroupChatMessage.update(msgId, { is_deleted: true });
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Floating chat button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setOpen(v => !v)}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${accentColor}, #ec4899)`, boxShadow: `0 0 24px ${accentColor}66` }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {unread > 0 && !open && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-gray-950">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-gray-950 border border-purple-700/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: 480, boxShadow: `0 0 40px ${accentColor}33` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-gray-800"
              style={{ background: `linear-gradient(135deg, ${accentColor}22, transparent)` }}>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" style={{ color: accentColor }} />
                <span className="text-white font-black text-sm">Group Chat</span>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-10 h-10 text-gray-700 mb-3" />
                  <p className="text-gray-500 text-sm font-semibold">No messages yet</p>
                  <p className="text-gray-700 text-xs mt-1">Be the first to chat!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.author_email === user?.email;
                  const canDel = isMe || admin;
                  return (
                    <div key={msg.id} className={`flex gap-2 group ${isMe ? "flex-row-reverse" : ""}`}>
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden bg-gray-800 flex items-center justify-center text-[10px] text-white font-bold mt-0.5">
                        {msg.author_avatar
                          ? <img src={msg.author_avatar} className="w-full h-full object-cover" alt="" />
                          : (msg.author_username || "G")[0].toUpperCase()
                        }
                      </div>
                      <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                        {!isMe && (
                          <span className="text-[9px] text-gray-500 font-semibold mb-0.5 ml-1">{msg.author_username}</span>
                        )}
                        <div className={`relative px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "text-white rounded-tr-sm"
                            : "bg-gray-800 text-gray-200 rounded-tl-sm"
                        }`}
                          style={isMe ? { background: `linear-gradient(135deg, ${accentColor}, #ec4899)` } : {}}>
                          {msg.content}
                          {canDel && (
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <span className="text-[8px] text-gray-700 mt-0.5 mx-1">{formatTime(msg.created_date)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-gray-800 p-3">
              {user ? (
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                    maxLength={500}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-50 flex-shrink-0 transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #ec4899)` }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => base44.auth.redirectToLogin(window.location.href)}
                    className="w-full py-2.5 rounded-xl text-white font-black text-sm"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #ec4899)` }}
                  >
                    Sign in to chat
                  </button>
                  <p className="text-gray-500 text-[10px] text-center font-semibold">Join the Group to start posting & chatting!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}