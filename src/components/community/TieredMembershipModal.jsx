import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Shield, Check, Zap, Crown, Rocket } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TIERS = [
  {
    id: "free_trial",
    name: "Free Trial",
    price: 0,
    period: "1 month",
    badge: "Try Free",
    color: "border-gray-600/60",
    headerBg: "linear-gradient(135deg, #1a1a2e, #0a0a1a)",
    badgeColor: "bg-gray-700/50 text-gray-300",
    icon: Star,
    iconColor: "text-gray-400",
    benefits: [
      "Post in Gaming Communities ✓",
      "Comment on posts",
      "Join all gaming groups",
      "Basic profile badge",
    ],
    cta: "Start Free Trial",
    ctaStyle: { background: "linear-gradient(135deg, #374151, #1f2937)" },
    note: "No payment needed — 1 month free",
  },
  {
    id: "tier1",
    name: "Tier 1",
    price: 0.99,
    period: "month",
    badge: "Most Popular",
    color: "border-purple-600/60",
    headerBg: "linear-gradient(135deg, #1a0a2a, #0a1040)",
    badgeColor: "bg-purple-700/50 text-purple-200",
    icon: Shield,
    iconColor: "text-purple-400",
    benefits: [
      "✅ Verified Partner Purple Checkmark",
      "🚫 Ad-free experience",
      "💬 Exclusive Group Chat access",
      "📧 Email alerts for new listings",
      "💌 Chat any user on the platform",
      "🎨 Free animated profile avatars",
      "🏆 AI Video Studio & Social Media Studio",
      "📌 Request new gaming categories",
    ],
    cta: "Avail Tier 1 — $0.99/mo",
    ctaStyle: { background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" },
    note: "Secure payment via PayPal",
  },
  {
    id: "tier2",
    name: "Tier 2 Pro",
    price: 2.99,
    period: "month",
    badge: "Creator",
    color: "border-yellow-500/60",
    headerBg: "linear-gradient(135deg, #1a1000, #2a1800)",
    badgeColor: "bg-yellow-700/40 text-yellow-200",
    icon: Crown,
    iconColor: "text-yellow-400",
    benefits: [
      "Everything in Tier 1 +",
      "👑 Gold Verified Creator Badge",
      "📊 Advanced Analytics Dashboard",
      "🎬 Priority Video Studio rendering",
      "💰 Creator monetization tools",
      "🔖 Featured listing placement",
      "📣 Community announcement posting",
      "🎁 Exclusive creator-only events",
    ],
    cta: "Avail Tier 2 — $2.99/mo",
    ctaStyle: { background: "linear-gradient(135deg, #ca8a04, #f59e0b)", boxShadow: "0 0 20px rgba(202,138,4,0.4)" },
    note: "Includes all Tier 1 benefits",
  },
  {
    id: "tier3",
    name: "Tier 3 Elite",
    price: 4.99,
    period: "month",
    badge: "Elite",
    color: "border-cyan-400/60",
    headerBg: "linear-gradient(135deg, #001a1a, #001040)",
    badgeColor: "bg-cyan-700/40 text-cyan-200",
    icon: Rocket,
    iconColor: "text-cyan-400",
    benefits: [
      "Everything in Tier 2 +",
      "🚀 Elite Diamond Badge",
      "🏪 Own storefront page",
      "📡 Live streaming priority",
      "🤝 Brand partnership opportunities",
      "🎤 Host official tournaments",
      "👑 Admin-level community tools",
      "🌐 Cross-platform content distribution",
    ],
    cta: "Avail Tier 3 — $4.99/mo",
    ctaStyle: { background: "linear-gradient(135deg, #0891b2, #06b6d4)", boxShadow: "0 0 20px rgba(8,145,178,0.4)" },
    note: "Full platform access",
  },
];

export default function TieredMembershipModal({ user, profile, onClose, onSuccess, initialTier = "tier1" }) {
  const [selectedTier, setSelectedTier] = useState(initialTier);
  const [step, setStep] = useState("select"); // select | waiting | done
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const tier = TIERS.find(t => t.id === selectedTier);
  const Icon = tier?.icon || Shield;

  const handleFreeTrial = async () => {
    setPaying(true);
    // Create a free trial subscription record
    await base44.entities.Tier1Subscription.create({
      user_email: user.email,
      username: profile?.username || user.full_name || "Gamer",
      amount: 0,
      status: "active",
      start_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_verified: false,
    });
    setStep("done");
    onSuccess?.("free_trial");
    setPaying(false);
  };

  const handlePurchase = async () => {
    if (selectedTier === "free_trial") { handleFreeTrial(); return; }
    setPaying(true);
    setError("");
    setStatusMsg("Creating secure PayPal order...");
    const res = await base44.functions.invoke("createTier1Order", { tier: selectedTier, amount: tier.price });
    const orderData = res?.data;
    if (orderData?.error) { setError(orderData.error); setPaying(false); setStatusMsg(""); return; }
    if (!orderData?.approvalUrl || !orderData?.orderId) { setError("Could not create order. Please try again."); setPaying(false); setStatusMsg(""); return; }
    setStatusMsg("Waiting for PayPal payment...");
    setStep("waiting");
    const popup = window.open(orderData.approvalUrl, "paypal_tier", "width=620,height=720");
    const timer = setInterval(async () => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setStatusMsg("Verifying payment...");
        const captureRes = await base44.functions.invoke("captureTier1Payment", { orderId: orderData.orderId, tier: selectedTier });
        const captureData = captureRes?.data;
        if (captureData?.success) { setStep("done"); onSuccess?.(selectedTier); }
        else { setError(captureData?.error || "Payment could not be verified. Contact support."); setStep("select"); }
        setPaying(false); setStatusMsg("");
      }
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-2 py-4 overflow-y-auto"
        style={{ background: "rgba(0,0,0,0.93)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={!paying ? onClose : undefined}
      >
        <motion.div
          className="w-full max-w-2xl bg-gray-950 rounded-3xl overflow-hidden border border-purple-700/40 my-auto"
          style={{ boxShadow: "0 0 60px rgba(124,58,237,0.25)" }}
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
          onClick={e => e.stopPropagation()}
        >
          {/* SUCCESS */}
          {step === "done" && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-purple-900/40 border-2 border-purple-500 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-white font-black text-2xl mb-2">
                {selectedTier === "free_trial" ? "Free Trial Active! 🎉" : "You're Verified! 🎉"}
              </h2>
              <p className="text-gray-400 text-sm mb-2">
                {selectedTier === "free_trial"
                  ? "Your 1-month free trial is now active. Enjoy posting & community features!"
                  : `Welcome to ${tier?.name}. Your badge & perks are now active.`}
              </p>
              <button onClick={onClose}
                className="mt-4 px-8 py-3 rounded-2xl font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Let's Go! 🚀
              </button>
            </div>
          )}

          {/* WAITING */}
          {step === "waiting" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
              <h2 className="text-white font-black text-lg mb-2">Complete Payment in PayPal</h2>
              <p className="text-gray-400 text-sm">{statusMsg}</p>
              <p className="text-gray-600 text-xs mt-4">After you approve, your subscription activates automatically.</p>
            </div>
          )}

          {/* SELECT TIER */}
          {step === "select" && (
            <>
              <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-black text-lg">Choose Your Membership</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Start free · Upgrade anytime · Monthly billing</p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tier cards */}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TIERS.map(t => {
                  const TIcon = t.icon;
                  const isSelected = selectedTier === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTier(t.id)}
                      className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all text-left ${t.color} ${isSelected ? "bg-white/5 scale-105" : "bg-gray-900/40 hover:bg-gray-900/60"}`}
                    >
                      {isSelected && <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: "#7c3aed" }} />}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mb-2 ${t.badgeColor}`}>{t.badge}</span>
                      <TIcon className={`w-6 h-6 mb-1.5 ${t.iconColor}`} />
                      <p className="text-white font-black text-xs text-center">{t.name}</p>
                      <div className="mt-1 text-center">
                        {t.price === 0 ? (
                          <span className="text-green-400 text-xs font-black">FREE</span>
                        ) : (
                          <>
                            <span className="text-white font-black text-sm">${t.price}</span>
                            <span className="text-gray-500 text-[9px]">/mo</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected tier details */}
              <div className="mx-4 mb-4 rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(124,58,237,0.3)" }}>
                <div className="p-4" style={{ background: tier?.headerBg }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon className={`w-5 h-5 ${tier?.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-white font-black">{tier?.name}</p>
                      <p className="text-gray-400 text-xs">
                        {tier?.price === 0 ? "Free for 1 month" : `$${tier?.price} / month`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-900/50 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {tier?.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                      <p className="text-gray-300 text-xs">{b}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 pb-5 space-y-3">
                {selectedTier !== "free_trial" && (
                  <div className="p-3 rounded-xl bg-green-900/20 border border-green-700/40 text-xs text-green-300 text-center">
                    🔒 Secured via PayPal · No card info stored on our servers
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/40 text-xs text-red-300">⚠️ {error}</div>
                )}
                <button
                  onClick={handlePurchase}
                  disabled={paying}
                  className="w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-60 flex items-center justify-center gap-2"
                  style={tier?.ctaStyle}
                >
                  {paying ? "Processing..." : tier?.cta}
                </button>
                <p className="text-gray-600 text-[10px] text-center">{tier?.note}</p>
                {selectedTier !== "free_trial" && (
                  <button
                    onClick={() => setSelectedTier("free_trial")}
                    className="w-full text-center text-gray-500 text-xs hover:text-gray-300 transition-colors"
                  >
                    Start with free trial instead →
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}