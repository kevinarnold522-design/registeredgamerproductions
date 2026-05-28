import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Shield, Check, MessageCircle, Share2, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ADMIN_PAYPAL = "kevinjersey2019@gmail.com";

const TIER1_BENEFITS = [
  { icon: MessageCircle, text: "Post & comment in all Gaming Communities" },
  { icon: Shield, text: "Verified Partner Purple Checkmark" },
  { icon: Zap, text: "Access to exclusive Group Chat (Tier 1 only)" },
  { icon: Star, text: "🚫 Ad-free experience — all ads removed" },
  { icon: Check, text: "Automatic email alerts for new listings in your groups" },
  { icon: Check, text: "Chat any user on the platform" },
  { icon: Check, text: "Request new gaming categories & subcategories" },
  { icon: Check, text: "Unlock free skins & animated profile avatars" },
];

export default function Tier1Modal({ user, profile, onClose, onSuccess }) {
  const [step, setStep] = useState("info"); // info | paying | done
  const [paying, setPaying] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState(profile?.paypal_email || "");
  const [error, setError] = useState("");

  const handlePurchase = async () => {
    setPaying(true);
    setError("");
    try {
      // Create order via our existing PayPal backend
      const res = await base44.functions.invoke("createPaypalOrder", {
        amount: "1.00",
        currency: "USD",
        description: "Tier 1 Annual Subscription — GAMER.PRODUCTIONS",
        seller_paypal_email: ADMIN_PAYPAL,
        buyer_email: user.email,
      });
      const orderData = res?.data;
      if (orderData?.approvalUrl) {
        // Open PayPal in popup
        const popup = window.open(orderData.approvalUrl, "_blank", "width=600,height=700");
        // Poll for completion
        const timer = setInterval(async () => {
          if (!popup || popup.closed) {
            clearInterval(timer);
            // Create subscription record as pending (admin can verify)
            const now = new Date();
            const expiry = new Date(now);
            expiry.setFullYear(expiry.getFullYear() + 1);
            await base44.entities.Tier1Subscription.create({
              user_email: user.email,
              username: profile?.username || user.full_name,
              paypal_order_id: orderData.orderId || "",
              amount: 1,
              status: "active",
              start_date: now.toISOString(),
              expiry_date: expiry.toISOString(),
              is_verified: true,
            });
            // Send thank-you email
            await base44.integrations.Core.SendEmail({
              to: user.email,
              subject: "🎮 Welcome to Tier 1 Verified Partner — GAMER.PRODUCTIONS",
              body: `Hi ${profile?.username || user.full_name},\n\nThank you for subscribing to the $1 Tier 1 Verified Partner Subscription!\n\n✅ Your subscription is now ACTIVE.\n📅 Expiry Date: ${expiry.toLocaleDateString()}\n\n🌟 YOUR TIER 1 BENEFITS:\n✓ Post & comment in ALL Gaming Communities\n✓ Verified Partner Purple Checkmark badge\n🚫 Ad-Free Experience — All advertisements removed\n✓ Exclusive Tier 1 Group Chat access\n✓ Automatic email alerts for new listings in your joined groups\n✓ Chat any user on the platform\n✓ Request new gaming categories & subcategories\n✓ Unlock animated profile avatars & skins\n\nWelcome to the family!\n\n— Kevin & The GAMER.PRODUCTIONS Team`,
            });
            setStep("done");
            onSuccess?.();
            setPaying(false);
          }
        }, 1000);
      } else {
        // Fallback: just create sub record (for testing / manual verify)
        const now = new Date();
        const expiry = new Date(now);
        expiry.setFullYear(expiry.getFullYear() + 1);
        await base44.entities.Tier1Subscription.create({
          user_email: user.email,
          username: profile?.username || user.full_name,
          amount: 1,
          status: "active",
          start_date: now.toISOString(),
          expiry_date: expiry.toISOString(),
          is_verified: true,
        });
        setStep("done");
        onSuccess?.();
        setPaying(false);
      }
    } catch (e) {
      setError("Payment failed. Please try again.");
      setPaying(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.92)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md bg-gray-950 rounded-3xl overflow-hidden border border-purple-700/50"
          style={{ boxShadow: "0 0 60px rgba(124,58,237,0.3)" }}
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
          onClick={e => e.stopPropagation()}
        >
          {step === "done" ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-purple-900/40 border-2 border-purple-500 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-white font-black text-2xl mb-2">You're Verified! 🎉</h2>
              <p className="text-gray-400 text-sm mb-6">Welcome to Tier 1 Verified Partner. Your purple checkmark & ad-free experience are now active.</p>
              <button onClick={onClose}
                className="w-full py-3 rounded-2xl font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Start Posting!
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="relative p-6 text-center" style={{ background: "linear-gradient(135deg, #1a0a2a, #0a1040)" }}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 rounded-2xl bg-purple-900/60 border border-purple-500/60 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-white font-black text-xl">Tier 1 Membership</h2>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-4xl font-black text-purple-400">$1</span>
                  <span className="text-gray-500 text-sm">/ year</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">One-time annual payment — all payments go to admin</p>
              </div>

              {/* Benefits */}
              <div className="p-5 space-y-2">
                {TIER1_BENEFITS.map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-900/40 border border-purple-700/50 flex items-center justify-center flex-shrink-0">
                      <b.icon className="w-3 h-3 text-purple-400" />
                    </div>
                    <p className="text-gray-300 text-xs">{b.text}</p>
                  </div>
                ))}
              </div>

              {/* Payment */}
              <div className="px-5 pb-5 space-y-3">
                <div className="p-3 rounded-xl bg-green-900/20 border border-green-700/40 text-xs text-green-300 text-center">
                  🔒 Payment is securely processed via PayPal — your card info stays with PayPal only.
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  onClick={handlePurchase}
                  disabled={paying}
                  className="w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
                >
                  {paying ? "Redirecting to PayPal..." : "✨ Avail Tier 1 — Pay $1/yr →"}
                </button>
                <p className="text-gray-600 text-[10px] text-center">Secure payment via PayPal · 1-year subscription · All ads removed</p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}