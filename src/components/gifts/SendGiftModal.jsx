import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift as GiftIcon, Lock, Star, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { GIFT_CATALOG } from "@/lib/giftCatalog";
import { computeUserPoints } from "@/lib/userPoints";

// Send a gift to another user. Supports free, points-cost, and paid gifts.
export default function SendGiftModal({ open, onClose, sender, senderProfile, recipientEmail, recipientUsername, onSent }) {
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const inIframe = typeof window !== "undefined" && window.self !== window.top;

  const send = async () => {
    if (!selected || !sender?.email) return;
    setSending(true);
    try {
      if (selected.type === "paid") {
        if (inIframe) {
          toast.error("Paid gifts only work from the published app — open it in a new tab.");
          setSending(false);
          return;
        }
        const res = await base44.functions.invoke("createGiftCheckout", {
          gift_id: selected.id,
          recipient_email: recipientEmail,
          recipient_username: recipientUsername || "",
          sender_email: sender.email,
          sender_username: senderProfile?.username || sender.full_name || "",
          message,
        });
        if (res?.data?.url) {
          window.location.href = res.data.url;
          return;
        }
        toast.error("Could not start checkout.");
        setSending(false);
        return;
      }

      // Points gift — verify the sender can afford it
      if (selected.type === "points") {
        const balance = await computeUserPoints(sender.email);
        if (balance < (selected.points || 0)) {
          toast.error(`Not enough points. You have ${balance.toLocaleString()}, need ${selected.points}.`);
          setSending(false);
          return;
        }
      }

      await base44.entities.Gift.create({
        sender_email: sender.email,
        sender_username: senderProfile?.username || sender.full_name || "",
        sender_avatar: senderProfile?.avatar_url || "",
        recipient_email: recipientEmail,
        recipient_username: recipientUsername || "",
        gift_id: selected.id,
        gift_label: selected.label,
        gift_emoji: selected.emoji,
        gift_type: selected.type,
        points_cost: selected.type === "points" ? selected.points : 0,
        message,
        payment_status: "none",
      });

      // Notify the recipient
      await base44.entities.Notification.create({
        user_email: recipientEmail,
        type: "system",
        title: `${selected.emoji} You received a gift!`,
        message: `${senderProfile?.username || sender.full_name || "A gamer"} sent you a ${selected.label}.`,
        link: "/profile",
      }).catch(() => {});

      toast.success(`Sent ${selected.emoji} ${selected.label}!`);
      onSent?.();
      onClose();
    } catch (e) {
      toast.error(e?.message || "Failed to send gift");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ background: "rgba(3,3,16,0.85)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-purple-600/50 p-6"
            style={{ background: "linear-gradient(160deg,#1a1340,#150e36)", boxShadow: "0 0 40px rgba(124,58,237,0.4)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <GiftIcon className="w-5 h-5 text-pink-400" />
                <h2 className="text-white font-black text-lg">Send a Gift</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full bg-black/40 text-gray-300 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-purple-200/70 text-xs mb-4">To <span className="font-bold text-purple-200">{recipientUsername || recipientEmail}</span></p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {GIFT_CATALOG.map((g) => {
                const active = selected?.id === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelected(g)}
                    className={`relative rounded-2xl py-3 flex flex-col items-center gap-1 border transition-all ${active ? "border-pink-500 bg-pink-900/30 scale-105" : "border-purple-800/50 bg-purple-900/20 hover:border-purple-600"}`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <span className="text-[10px] text-purple-200 font-bold leading-none">{g.label}</span>
                    {g.type === "free" && <span className="text-[9px] text-green-400 font-black">FREE</span>}
                    {g.type === "points" && <span className="text-[9px] text-yellow-400 font-black flex items-center gap-0.5"><Star className="w-2.5 h-2.5" />{g.points}</span>}
                    {g.type === "paid" && <span className="text-[9px] text-cyan-300 font-black">${(g.price / 100).toFixed(2)}</span>}
                  </button>
                );
              })}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)"
              rows={2}
              className="w-full rounded-xl bg-purple-950/40 border border-purple-800/50 px-3 py-2 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-500 resize-none mb-4"
            />

            <button
              onClick={send}
              disabled={!selected || sending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm disabled:opacity-40"
              style={{ boxShadow: "0 0 18px rgba(168,85,247,0.4)" }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : selected?.type === "paid" ? <Lock className="w-4 h-4" /> : <GiftIcon className="w-4 h-4" />}
              {selected?.type === "paid" ? `Pay $${(selected.price / 100).toFixed(2)} & Send` : "Send Gift"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}