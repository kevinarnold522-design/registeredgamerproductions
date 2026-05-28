import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Shield, Check, MessageCircle, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
  const [step, setStep] = useState("info"); // info | waiting | done | error
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const handlePurchase = async () => {
    setPaying(true);
    setError("");
    setStatusMsg("Creating secure PayPal order...");

    // Step 1: Create the PayPal order via backend (uses stored PAYPAL_CLIENT_ID / SECRET)
    const res = await base44.functions.invoke("createTier1Order", {});
    const orderData = res?.data;

    if (orderData?.error) {
      setError(orderData.error);
      setPaying(false);
      setStatusMsg("");
      return;
    }

    if (!orderData?.approvalUrl || !orderData?.orderId) {
      setError("Could not create PayPal order. Please try again.");
      setPaying(false);
      setStatusMsg("");
      return;
    }

    // Step 2: Open PayPal approval in a popup
    setStatusMsg("Waiting for PayPal payment...");
    setStep("waiting");
    const popup = window.open(orderData.approvalUrl, "paypal_tier1", "width=620,height=720");

    // Step 3: Poll for popup close, then capture payment on backend
    const timer = setInterval(async () => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        setStatusMsg("Verifying payment with PayPal...");

        // Step 4: Securely capture & verify on backend
        const captureRes = await base44.functions.invoke("captureTier1Payment", {
          orderId: orderData.orderId,
        });
        const captureData = captureRes?.data;

        if (captureData?.success) {
          setStep("done");
          onSuccess?.();
        } else {
          setError(captureData?.error || "Payment could not be verified. If you paid, contact support.");
          setStep("info");
        }
        setPaying(false);
        setStatusMsg("");
      }
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.92)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={!paying ? onClose : undefined}
      >
        <motion.div
          className="w-full max-w-md bg-gray-950 rounded-3xl overflow-hidden border border-purple-700/50"
          style={{ boxShadow: "0 0 60px rgba(124,58,237,0.3)" }}
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── SUCCESS ── */}
          {step === "done" && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-purple-900/40 border-2 border-purple-500 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-white font-black text-2xl mb-2">You're Verified! 🎉</h2>
              <p className="text-gray-400 text-sm mb-2">Welcome to Tier 1 Verified Partner.</p>
              <p className="text-gray-500 text-xs mb-6">Your purple checkmark & ad-free experience are now active. Check your email for a confirmation.</p>
              <button onClick={onClose}
                className="w-full py-3 rounded-2xl font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Start Posting! 🚀
              </button>
            </div>
          )}

          {/* ── WAITING / PROCESSING ── */}
          {step === "waiting" && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
              <h2 className="text-white font-black text-lg mb-2">Complete Payment in PayPal</h2>
              <p className="text-gray-400 text-sm mb-1">{statusMsg || "Waiting for PayPal..."}</p>
              <p className="text-gray-600 text-xs mt-4">After you approve the payment in the PayPal popup, your subscription will be automatically activated and verified.</p>
            </div>
          )}

          {/* ── INFO / PAY ── */}
          {(step === "info") && (
            <>
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
                <p className="text-gray-400 text-xs mt-1">Secure one-time annual payment via PayPal</p>
              </div>

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

              <div className="px-5 pb-5 space-y-3">
                <div className="p-3 rounded-xl bg-green-900/20 border border-green-700/40 text-xs text-green-300 text-center">
                  🔒 Fully secured via PayPal — your payment goes directly to the admin account. Card info never touches our servers.
                </div>
                {error && (
                  <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/40 text-xs text-red-300">
                    ⚠️ {error}
                  </div>
                )}
                <button
                  onClick={handlePurchase}
                  disabled={paying}
                  className="w-full py-4 rounded-2xl font-black text-white text-base disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}
                >
                  {paying ? "Creating secure order..." : "✨ Avail Tier 1 — Pay $1/yr via PayPal →"}
                </button>
                <p className="text-gray-600 text-[10px] text-center">Secure payment via PayPal · 1-year subscription · Payment verified server-side</p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}