import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      if (!me) { base44.auth.redirectToLogin("/messages"); return; }
      setUser(me);
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (profiles.length > 0) setProfile(profiles[0]);

      const [convA, convB] = await Promise.all([
        base44.entities.Conversation.filter({ participant_a: me.email }),
        base44.entities.Conversation.filter({ participant_b: me.email }),
      ]);
      const all = [...convA, ...convB].sort((a, b) => new Date(b.last_message_date || b.created_date) - new Date(a.last_message_date || a.created_date));
      setConversations(all);

      // Check if a specific conversation is pre-selected from URL
      const params = new URLSearchParams(window.location.search);
      const convId = params.get("conv");
      const withEmail = params.get("with");
      if (convId) {
        const found = all.find(c => c.id === convId);
        if (found) { setActiveConv(found); loadMessages(found.id, me.email); }
      } else if (withEmail) {
        // Start or open conversation
        await openOrCreateConversation(withEmail, me, profiles[0], all);
      }

      setLoading(false);
    };
    init();
  }, []);

  const openOrCreateConversation = async (otherEmail, me, myProfile, existing) => {
    const found = existing.find(c =>
      (c.participant_a === me.email && c.participant_b === otherEmail) ||
      (c.participant_b === me.email && c.participant_a === otherEmail)
    );
    if (found) {
      setActiveConv(found);
      loadMessages(found.id, me.email);
    } else {
      const otherProfiles = await base44.entities.UserProfile.filter({ user_email: otherEmail });
      const otherProfile = otherProfiles[0];
      const conv = await base44.entities.Conversation.create({
        participant_a: me.email,
        participant_b: otherEmail,
        participant_a_username: myProfile?.username || me.full_name,
        participant_b_username: otherProfile?.username || otherEmail,
        participant_a_avatar: myProfile?.avatar_url || "",
        participant_b_avatar: otherProfile?.avatar_url || "",
      });
      setConversations(prev => [conv, ...prev]);
      setActiveConv(conv);
    }
  };

  const loadMessages = async (convId, myEmail) => {
    const msgs = await base44.entities.Message.filter({ conversation_id: convId });
    setMessages(msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    // Mark unread
    const unread = msgs.filter(m => m.recipient_email === myEmail && !m.is_read);
    await Promise.all(unread.map(m => base44.entities.Message.update(m.id, { is_read: true })));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConv = (conv) => {
    setActiveConv(conv);
    loadMessages(conv.id, user.email);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeConv || !user) return;
    setSending(true);
    const otherEmail = activeConv.participant_a === user.email ? activeConv.participant_b : activeConv.participant_a;
    const msg = await base44.entities.Message.create({
      conversation_id: activeConv.id,
      sender_email: user.email,
      sender_username: profile?.username || user.full_name,
      sender_avatar: profile?.avatar_url || "",
      recipient_email: otherEmail,
      content: draft.trim(),
    });
    await base44.entities.Conversation.update(activeConv.id, {
      last_message: draft.trim(),
      last_message_date: new Date().toISOString(),
    });
    setMessages(prev => [...prev, msg]);
    setDraft("");
    setSending(false);
  };

  const getOtherName = (conv) => {
    if (!user) return "";
    return conv.participant_a === user.email ? conv.participant_b_username : conv.participant_a_username;
  };
  const getOtherAvatar = (conv) => {
    if (!user) return "";
    return conv.participant_a === user.email ? conv.participant_b_avatar : conv.participant_a_avatar;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-16 h-screen flex">
        {/* Sidebar */}
        <div className={`w-full md:w-72 bg-gray-950 border-r border-gray-800 flex flex-col ${activeConv ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-white font-black flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-400" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm px-4">
                No conversations yet.<br />Visit a seller's profile to start chatting.
              </div>
            ) : (
              conversations.map(conv => {
                const name = getOtherName(conv);
                const avatar = getOtherAvatar(conv);
                const isActive = activeConv?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConv(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-800/60 hover:bg-gray-800/50 transition-colors text-left ${isActive ? "bg-purple-900/20 border-l-2 border-l-purple-500" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : "🎮"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{name}</p>
                      <p className="text-gray-400 text-xs truncate">{conv.last_message || "No messages yet"}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        {activeConv ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950">
              <button onClick={() => setActiveConv(null)} className="md:hidden text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden">
                {getOtherAvatar(activeConv) ? <img src={getOtherAvatar(activeConv)} alt="" className="w-full h-full object-cover" /> : "🎮"}
              </div>
              <p className="text-white font-bold">{getOtherName(activeConv)}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => {
                const isMe = m.sender_email === user?.email;
                return (
                  <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none" : "bg-gray-800 text-gray-100 rounded-bl-none"}`}>
                      <p className="leading-relaxed">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-purple-200" : "text-gray-500"}`}>
                        {new Date(m.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-3 border-t border-gray-800 bg-gray-950">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
              />
              <button type="submit" disabled={sending || !draft.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity">
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-gray-600 flex-col gap-3">
            <MessageCircle className="w-16 h-16 opacity-20" />
            <p className="font-semibold">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}