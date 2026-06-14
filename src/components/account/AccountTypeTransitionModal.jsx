import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, Wand2, Store, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AccountTypeTransitionModal({ currentType, user, onClose, onSuccess }) {
  const [answers, setAnswers] = useState({ what: "", platform: "", experience: "" });
  const [updating, setUpdating] = useState(false);

  const isGamer = currentType === "regular";
  const targetType = isGamer ? "digital_creator" : "business";
  const targetLabel = isGamer ? "Digital Creator" : "Business Owner";

  const questions = isGamer
    ? [
        { key: "what", label: "What type of content will you create?", placeholder: "e.g., Game mods, skins, maps, guides..." },
        { key: "platform", label: "Which platforms do you create for?", placeholder: "e.g., PC, PS5, Xbox..." },
        { key: "experience", label: "Tell us about your experience", placeholder: "e.g., Beginner, Hobbyist, Professional..." },
      ]
    : [
        { key: "what", label: "What products will you sell?", placeholder: "e.g., Gaming gear, consoles, merchandise..." },
        { key: "platform", label: "Where do you source/sell from?", placeholder: "e.g., Physical store, Marketplace..." },
        { key: "experience", label: "Business experience level", placeholder: "e.g., New business, Established seller..." },
      ];

  const handleSubmit = async () => {
    if (!answers.what.trim() || !answers.platform.trim()) {
      toast.error("Please answer all questions");
      return;
    }

    setUpdating(true);
    
    // FIX: Use user.id (UUID) instead of user.email for the update lookup.
    // Ensure the profile table in Supabase uses the same ID as the Auth user.
    try {
      console.log("Attempting to update user ID:", user?.id, "to", targetType);
      
      const { error } = await base44.entities.UserProfile.update(user.id, { 
        account_type: targetType 
      });

      if (error) throw error;

      toast.success(`Successfully transitioned to ${targetLabel}!`);
      onSuccess?.(targetType);
      onClose();
    } catch (err) {
      console.error("Transition failed. Supabase error details:", err);
      toast.error(`Transition failed: ${err.message || "Permission denied"}`);
    } finally {
      setUpdating(false);
    }
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isGamer ? <Wand2 className="w-5 h-5 text-purple-400" /> : <Store className="w-5 h-5 text-green-400" />}
              <h3 className="text-white font-black text-base">Become a {targetLabel}</h3>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-5">
            {questions.map((q, i) => (
              <div key={q.key}>
                <label className="text-gray-400 text-xs font-semibold mb-1 block">{i + 1}. {q.label}</label>
                <input
                  value={answers[q.key]}
                  onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                  placeholder={q.placeholder}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={updating}
            className={`w-full py-3 rounded-xl font-black text-white text-sm ${isGamer ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-gradient-to-r from-green-600 to-emerald-600"} disabled:opacity-50`}
          >
            {updating ? "Updating..." : "Confirm Transition"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
