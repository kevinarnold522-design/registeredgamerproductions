import React, { useState } from "react";
import { Lock, Unlink, Eye, EyeOff, Shield } from "lucide-react";

const ADMIN_PAYPAL = {
  clientId: "AU69KZ-7fS4IKtLLD8NdX4CXRY2N3g3ERjE4w9ZmN_p6mVEBs0YVHrCEWLVPlbq55w5bX",
  secret: "AU69KZ-7fS4IKtLLD8NdXUVEyG7XlLSwsmzOVAwfYfQAlbu4dbFCXCQTVaEOzZkeI9nJlJwRJQ5Hu2Sc",
  accountEmail: "kevinarnold522@gmail.com",
  accountName: "Kevin Arnold",
  accountType: "Business",
  status: "Active & Verified",
};

export default function AdminPayPalPanel() {
  const [unlinked, setUnlinked] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  if (unlinked) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl">
        <div className="text-center py-8">
          <Unlink className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-bold">Admin PayPal account has been unlinked.</p>
          <p className="text-gray-600 text-sm mt-1">Contact your developer to re-configure payment credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg">Admin PayPal Account</h3>
          <p className="text-blue-400 text-xs font-semibold">Platform Payment Receiver — 10% Commission</p>
        </div>
        <span className="ml-auto px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-black">
          ✓ ACTIVE
        </span>
      </div>

      {/* Locked Fields */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">

        {/* Email */}
        <div>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1.5">PayPal Account Email</p>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700">
            <Lock className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
            <p className="text-white font-semibold text-sm">{ADMIN_PAYPAL.accountEmail}</p>
          </div>
        </div>

        {/* Client ID */}
        <div>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1.5">PayPal Client ID</p>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700">
            <Lock className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
            <p className="text-white font-mono text-xs flex-1 truncate">
              {showClientId ? ADMIN_PAYPAL.clientId : ADMIN_PAYPAL.clientId.substring(0, 16) + "••••••••••••••••••••••••"}
            </p>
            <button onClick={() => setShowClientId(v => !v)} className="text-gray-500 hover:text-gray-300 transition-colors">
              {showClientId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Secret */}
        <div>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1.5">PayPal Secret Key</p>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-800/60 border border-gray-700">
            <Lock className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
            <p className="text-white font-mono text-xs flex-1 truncate">
              {showSecret ? ADMIN_PAYPAL.secret : "••••••••••••••••••••••••••••••••••••••••••••"}
            </p>
            <button onClick={() => setShowSecret(v => !v)} className="text-gray-500 hover:text-gray-300 transition-colors">
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Account Details Row */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3">
            <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Name</p>
            <p className="text-white text-sm font-semibold">{ADMIN_PAYPAL.accountName}</p>
          </div>
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3">
            <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Type</p>
            <p className="text-white text-sm font-semibold">{ADMIN_PAYPAL.accountType}</p>
          </div>
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3">
            <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Status</p>
            <p className="text-green-400 text-sm font-semibold">✓ Verified</p>
          </div>
        </div>

        {/* Lock notice */}
        <div className="flex items-center gap-2 text-gray-600 text-xs pt-1">
          <Lock className="w-3 h-3 flex-shrink-0" />
          <span>These credentials are locked and read-only. Click "Unlink" below to disconnect.</span>
        </div>
      </div>

      {/* Unlink */}
      <div className="mt-4">
        {!confirmUnlink ? (
          <button
            onClick={() => setConfirmUnlink(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-900/20 border border-red-700/40 text-red-400 text-sm font-bold hover:bg-red-900/30 transition-colors"
          >
            <Unlink className="w-4 h-4" />
            Unlink Admin PayPal Account
          </button>
        ) : (
          <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-4 flex items-center justify-between gap-4">
            <p className="text-red-300 text-sm font-semibold">Are you sure? This will disable platform payments.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmUnlink(false)} className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={() => setUnlinked(true)} className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700">
                Yes, Unlink
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}