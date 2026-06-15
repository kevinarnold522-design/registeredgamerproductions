import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Store } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AccountTypeTransitionModal({ currentType, user, onClose, onSuccess }) {
  const [answers, setAnswers] = useState({ what: "", platform: "", experience: "" });
  const [updating, setUpdating] = useState(false);

  const isGamer = currentType === "regular";
  const targetType = isGamer ? "digital_creator" : "business";
  const targetLabel = isGamer ? "Digital Creator" : "Business Owner";

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (updating) return;

    if (!user?.email) {
      toast.error("User identification missing.");
      return;
    }

    setUpdating(true);

    try {
      // Find the correct UserProfile record by email (NOT by user.id — those differ)
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      let profileRecord = profiles[0];

      // Create a profile if one doesn't exist yet
      if (!profileRecord) {
        profileRecord = await base44.entities.UserProfile.create({
          user_email: user.email,
          username: (user.full_name || user.email.split("@")[0]).replace(/\s/g, "").toLowerCase(),
          account_type: targetType,
        });
      } else {
        await base44.entities.UserProfile.update(profileRecord.id, { account_type: targetType });
      }

      toast.success(`Successfully became a ${targetLabel}!`);
      onSuccess?.(targetType);
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred.");
      setUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80"
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-950 border border-purple-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              {isGamer ? <Wand2 className="text-purple-400" /> : <Store className="text-green-400" />}
              Become a {targetLabel}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
          </div>

          <div className="space-y-4">
            <input 
              placeholder={isGamer ? "What content will you create? (optional)" : "What products will you sell? (optional)"}
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white"
              value={answers.what}
              onChange={(e) => setAnswers({...answers, what: e.target.value})}
            />
            <input 
              placeholder={isGamer ? "Which platforms? (optional)" : "Where do you sell from? (optional)"}
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white"
              value={answers.platform}
              onChange={(e) => setAnswers({...answers, platform: e.target.value})}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={updating}
            className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
          >
            {updating ? "Updating..." : "Confirm Transition"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}