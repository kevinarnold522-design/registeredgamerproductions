import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Shield, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const PLEDGE_ITEMS = [
  "I will NOT post anything off-topic or unrelated to the community.",
  "I will NOT spam, advertise, or self-promote inappropriately.",
  "I will NOT allow or post illegal content of any kind.",
  "I will enforce community rules fairly and without bias.",
  "I understand that violating these terms will result in immediate removal.",
];

export default function ModeratorRequestModal({ franchise, community, user, profile, onClose, onSubmitted }) {
  const [step, setStep] = useState(1); // 1=why, 2=plan, 3=pledge, 4=done
  const [why, setWhy] = useState("");
  const [plan, setPlan] = useState("");
  const [pledged, setPledged] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const togglePledge = (i) => {
    setPledged(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };
  const allPledged = pledged.length === PLEDGE_ITEMS.length;

  const handleSubmit = async () => {
    if (!allPledged) return;
    setSubmitting(true);
    await base44.entities.SectionRequest.create({
      franchise_id: franchise.id,
      community_id: community?.id || "",
      requested_by: user.email,
      requester_username: profile?.username || user.full_name,
      section_name: `MOD_REQUEST: ${user.email}`,
      section_description: JSON.stringify({
        why,
        plan,
        pledged: true,
        community: franchise.name,
      }),
      status: "pending",
    });
    setSubmitting(false);
    setStep(4);
    onSubmitted?.();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.95)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md bg-gray-950 rounded-3xl overflow-hidden border border-yellow-600/40"
        style={{ boxShadow: "0 0 40px rgba(234,179,8,0.15)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-800 flex items-center gap-3 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #1a1200, #0a1040)" }}>
          <div className="w-10 h-10 rounded-xl bg-yellow-900/40 border border-yellow-600/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-black text-sm">Apply as Group Captain</h2>
            <p className="text-gray-400 text-xs">{franchise.name} · Step {step} of 4</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500 hover:text-white" /></button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-6 py-2 flex-shrink-0">
          {[1,2,3,4].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${step >= s ? "bg-yellow-500" : "bg-gray-800"}`} />
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-6 pb-6">
          {/* Step 1 — Why */}
          {step === 1 && (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-white font-bold text-sm mb-1">Why do you want to moderate <span className="text-yellow-400">{franchise.name}</span>?</p>
                <p className="text-gray-500 text-xs mb-3">Be honest and specific. Low-effort answers will be rejected.</p>
                <textarea
                  value={why}
                  onChange={e => setWhy(e.target.value)}
                  rows={5}
                  placeholder="e.g. I've been part of this community for a long time, I love keeping discussions on-topic and helping new members..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none"
                />
                <p className="text-gray-600 text-xs mt-1">{why.length}/500 characters</p>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={why.trim().length < 30}
                className="w-full py-3 rounded-xl font-black text-sm text-white disabled:opacity-40 transition-all"
                style={{ background: "linear-gradient(135deg, #ca8a04, #a16207)" }}>
                Next →
              </button>
            </div>
          )}

          {/* Step 2 — How do you plan to moderate */}
          {step === 2 && (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-white font-bold text-sm mb-1">📋 Interview Question</p>
                <p className="text-gray-400 text-xs mb-3">How do you plan to keep <span className="text-yellow-400">{franchise.name}</span> on-topic, welcoming, and spam/illegal-content free? What actions would you take if a member posted something inappropriate?</p>
                <textarea
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                  rows={6}
                  placeholder="Describe your moderation approach, how you'd handle rule violations, conflicts, and how you'd welcome new members..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-yellow-500 resize-none"
                />
                <p className="text-gray-600 text-xs mt-1">{plan.length}/800 characters</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-400 bg-gray-900 border border-gray-700">
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={plan.trim().length < 50}
                  className="flex-1 py-3 rounded-xl font-black text-sm text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #ca8a04, #a16207)" }}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Pledge */}
          {step === 3 && (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-white font-bold text-sm mb-1">✋ Moderator Pledge</p>
                <p className="text-gray-400 text-xs mb-3">Check each box to acknowledge your commitment. You MUST agree to all of these:</p>
                <div className="space-y-2">
                  {PLEDGE_ITEMS.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => togglePledge(i)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${pledged.includes(i) ? "bg-green-900/20 border-green-700/50" : "bg-gray-900 border-gray-700 hover:border-gray-500"}`}
                    >
                      <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border ${pledged.includes(i) ? "bg-green-600 border-green-600" : "border-gray-600"}`}>
                        {pledged.includes(i) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <p className={`text-xs ${pledged.includes(i) ? "text-green-300" : "text-gray-400"}`}>{item}</p>
                    </button>
                  ))}
                </div>
              </div>
              {!allPledged && (
                <p className="text-yellow-500 text-xs text-center">Please acknowledge all {PLEDGE_ITEMS.length} items above</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-400 bg-gray-900 border border-gray-700">
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!allPledged || submitting}
                  className="flex-1 py-3 rounded-xl font-black text-sm text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Done */}
          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-900/30 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-black text-lg mb-2">Application Submitted! 🎉</p>
              <p className="text-gray-400 text-sm mb-1">Your moderator application for <span className="text-yellow-400">{franchise.name}</span> has been sent to admin for review.</p>
              <p className="text-gray-600 text-xs mb-6">You'll be notified once a decision is made. Thank you for your interest in keeping this community great!</p>
              <button onClick={onClose}
                className="w-full py-3 rounded-xl font-black text-white text-sm"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}