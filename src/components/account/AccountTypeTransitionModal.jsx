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
    // 1. Validation
    if (!answers.what.trim() || !answers.platform.trim()) {
      toast.error("Please fill in the required fields");
      return;
    }

    // 2. Identify the user
    const userId = user?.id || user?.email;
    if (!userId) {
      toast.error("Account error: No user ID found.");
      return;
    }

    setUpdating(true);
    console.log("Submitting transition for:", userId);

    try {
      // 3. The Update Call
      const response = await base44.entities.UserProfile.update(userId, { 
        account_type: targetType 
      });

      // 4. Handle success or error response
      if (response?.error) throw new Error(response.error.message);

      toast.success(`Success! Now a ${targetLabel}`);
      onSuccess?.(targetType);
      
      // Force refresh to update the UI
      setTimeout(() => window.location.reload(), 500);
      onClose();

    } catch (err) {
      console.error("Transition failed:", err);
      toast.error("Failed: " + (err.message || "Server Error"));
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
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
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
              placeholder="What type of content/products?"
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white"
              onChange={(e) => setAnswers({...answers, what: e.target.value})}
            />
            <input 
              placeholder="Which platforms?"
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white"
              onChange={(e) => setAnswers({...answers, platform: e.target.value})}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={updating}
            className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all"
          >
            {updating ? "Updating..." : "Confirm Transition"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
