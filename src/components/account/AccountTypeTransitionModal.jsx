import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, Wand2, Store, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AccountTypeTransitionModal({ currentType, user, onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ what: "", platform: "", experience: "" });
  const [updating, setUpdating] = useState(false);

  const isGamer = currentType === "regular";
  const isCreator = currentType === "digital_creator";
  const targetType = isGamer ? "digital_creator" : "business";
  const targetLabel = isGamer ? "Digital Creator" : "Business Owner";

  const questions = isGamer
    ? [
        { key: "what", label: "What type of content will you create?", placeholder: "e.g., Game mods, skins, maps, guides, tutorials..." },
        { key: "platform", label: "Which platforms do you create for?", placeholder: "e.g., PC, PS5, Xbox, Mobile games..." },
        { key: "experience", label: "Tell us about your experience", placeholder: "e.g., Beginner, Hobbyist, Professional..." },
      ]
    : [
        { key: "what", label: "What products will you sell?", placeholder: "e.g., Gaming gear, consoles, accessories, merchandise..." },
        { key: "platform", label: "Where do you source/sell from?", placeholder: "e.g., Physical store, Online marketplace, Direct import..." },
        { key: "experience", label: "Business experience level", placeholder: "e.g., New business, Established seller, Registered company..." },
      ];

  const handleSubmit = async () => {
    if (!answers.what.trim() || !answers.platform.trim()) {
      toast.error("Please answer all questions");
      return;
    }
    setUpdating(true);
    try {
      await base44.entities.UserProfile.update(user.email, { account_type: targetType });
      toast.success(`Successfully transitioned to ${targetLabel}!`);
      onSuccess?.(targetType);
      onClose();
    } catch (err) {
      toast.error("Failed to update account type");
    }
    setUpdating(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-950 border border-purple-700/40 rounded-3xl p-6 w-full max-w-lg shadow-2xl shadow-purple-900/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isGamer ? <Wand2 className="w-5 h-5 text-purple-400" /> : <Store className="w-5 h-5 text-green-400" />}
              <h3 className="text-white font-black text-base">Become a {targetLabel}</h3>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Banner */}
          <div className={`p-3 rounded-xl mb-4 ${isGamer ? "bg-purple-900/20 border border-purple-700/30" : "bg-green-900/20 border border-green-700/30"}`}>
            <p className="text-white text-sm font-semibold mb-1">
              {isGamer ? "🎨 Unlock Creator Features" : "💼 Unlock Business Features"}
            </p>
            <p className="text-gray-400 text-xs">
              {isGamer
                ? "Create & sell mods, skins, maps, guides, and more. Earn from views and downloads."
                : "Sell physical products, manage inventory, accept payments, and grow your business."}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-3 mb-5">
            {questions.map((q, i) => (
              <div key={q.key}>
                <label className="text-gray-400 text-xs font-semibold mb-1 block">{i + 1}. {q.label}</label>
                <input
                  value={answers[q.key]}
                  onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                  placeholder={q.placeholder}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={updating}
            className={`w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all ${
              isGamer
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            } disabled:opacity-50`}
          >
            {updating ? "Updating..." : (
              <>
                Confirm Transition <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-gray-600 text-[10px] text-center mt-3">
            You can update your profile details after transitioning
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}