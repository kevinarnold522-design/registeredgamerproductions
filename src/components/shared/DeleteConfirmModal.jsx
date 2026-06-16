import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Shield } from "lucide-react";

/**
 * DeleteConfirmModal — multi-step delete flow:
 *  1. "Are you sure?" 
 *  2. "Do you think there are ways to save this instead?" (with options)
 *  3. If admin: proceed to delete. If account_moderator: flag for admin approval.
 *
 * Props:
 *   label: string        — what's being deleted (e.g. "WWE2K subcategory card")
 *   isAdmin: boolean
 *   isAccountMod: boolean
 *   onDelete: fn         — called when final delete is confirmed
 *   onRequestDelete: fn  — called when account mod requests deletion (for admin approval)
 *   onClose: fn
 */
export default function DeleteConfirmModal({ label = "this item", isAdmin, isAccountMod, onDelete, onRequestDelete, onClose }) {
  const [step, setStep] = useState(1); // 1=sure?, 2=save alternatives?, 3=final

  const SAVE_OPTIONS = [
    { id: "edit", label: "Edit the content instead" },
    { id: "hide", label: "Hide it temporarily" },
    { id: "archive", label: "Archive for later" },
    { id: "no", label: "No, proceed with deletion" },
  ];

  const [saveChoice, setSaveChoice] = useState(null);

  const handleSaveChoice = (id) => {
    setSaveChoice(id);
    if (id !== "no") {
      // User chose to save — close and let parent handle
      onClose();
      return;
    }
    setStep(3);
  };

  const handleFinalDelete = () => {
    if (isAdmin) {
      onDelete?.();
    } else if (isAccountMod) {
      // Account mod: request deletion — admin must approve
      onRequestDelete?.();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.92)" }}>
      <motion.div
        className="bg-gray-950 border border-red-700/40 rounded-2xl p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {/* Step 1: Are you sure? */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-700/50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-black">Delete {label}?</h3>
                  <p className="text-gray-500 text-xs mt-0.5">This action cannot be undone.</p>
                </div>
              </div>

              {!isAdmin && !isAccountMod && (
                <div className="p-3 rounded-xl bg-yellow-950/30 border border-yellow-700/40 mb-4">
                  <p className="text-yellow-400 text-xs font-bold">Only admins and Account Moderators can delete content.</p>
                </div>
              )}

              {isAccountMod && !isAdmin && (
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-700/40 mb-4">
                  <Shield className="w-4 h-4 text-blue-400 inline mr-1" />
                  <span className="text-blue-300 text-xs font-bold">Your deletion request will be sent to admin for final approval.</span>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-bold text-sm hover:bg-gray-900 transition-all">
                  Cancel
                </button>
                {(isAdmin || isAccountMod) && (
                  <button onClick={() => setStep(2)}
                    className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black text-sm transition-all">
                    Yes, Delete
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Ways to save? */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-700/50 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-black">Before you delete…</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Are there ways to save this instead?</p>
                </div>
              </div>

              <div className="space-y-2">
                {SAVE_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => handleSaveChoice(opt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${opt.id === "no"
                      ? "border-red-700/40 bg-red-950/20 hover:bg-red-950/40 text-red-300"
                      : "border-gray-700 bg-gray-900 hover:border-purple-600 hover:bg-gray-800 text-white"}`}>
                    <CheckCircle className="w-4 h-4 text-purple-300" />
                    <span className="text-sm font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Final confirm */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-900/40 border border-red-700/50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-black">Final Confirmation</h3>
                  {isAccountMod && !isAdmin && (
                    <p className="text-blue-400 text-xs mt-0.5">Admin will review & approve this deletion.</p>
                  )}
                  {isAdmin && (
                    <p className="text-red-400 text-xs mt-0.5">This will permanently delete the item.</p>
                  )}
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-5">
                {isAdmin
                  ? `You're about to permanently delete "${label}". This cannot be reversed.`
                  : `Your deletion request for "${label}" will be sent to admin for final approval.`
                }
              </p>

              <div className="flex gap-2">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-bold text-sm hover:bg-gray-900 transition-all">
                  Cancel
                </button>
                <button onClick={handleFinalDelete}
                  className="flex-1 py-2.5 rounded-xl font-black text-white text-sm transition-all"
                  style={{ background: isAdmin ? "#dc2626" : "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}>
                  {isAdmin ? "Delete Now" : "Request Deletion"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}