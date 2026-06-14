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

    const userId = user?.id || user?.email;
    if (!userId) {
      toast.error("User identification missing.");
      return;
    }

    setUpdating(true);
    console.log("Initiating API call for:", userId);

    // 2. Set a 10-second timeout to prevent infinite loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Server took too long to respond.")), 10000)
    );

    try {
      // 3. Race the API call against the timeout
      const response = await Promise.race([
        base44.entities.UserProfile.update(userId, { account_type: targetType }),
        timeoutPromise
      ]);

      console.log("API Response received:", response);

      // Handle common API error structures
      if (response?.error) {
        throw new Error(response.error.message || "Update failed");
      }

      toast.success(`Successfully became a ${targetLabel}!`);
      onSuccess?.(targetType);
      
      // Short delay so the user sees the success toast before refresh
      setTimeout(() => window.location.reload(), 1000);
      onClose();

    } catch (err) {
      console.error("Critical Failure:", err);
      toast.error(err.message || "An unexpected error occurred.");
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
              placeholder={isGamer ? "What content will you create?" : "What products will you sell?"}
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white"
              value={answers.what}
              onChange={(e) => setAnswers({...answers, what: e.target.value})}
            />
            <input 
              placeholder={isGamer ? "Which platforms?" : "Where do you sell from?"}
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
