import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Lock, Eye, EyeOff, Unlink, CheckCircle } from "lucide-react";

export default function PaymentMethodsTab({ profile, onProfileUpdate }) {
  const hasPaypal = !!(profile?.paypal_email);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const handleConnect = async () => {
    if (!paypalEmail.includes("@")) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, {
      paypal_email: paypalEmail,
      payout_method: "paypal",
    });
    setSaving(false);
    window.location.reload();
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    await base44.entities.UserProfile.update(profile.id, {
      paypal_email: null,
      paypal_merchant_id: null,
      paypal_account_name: null,
      paypal_account_type: null,
      paypal_country: null,
      payout_method: null,
    });
    setUnlinking(false);
    setConfirmUnlink(false);
    window.location.reload();
  };

  return (
    <div className="max-w-xl">
      <h3 className="text-white font-black text-xl mb-1">Payments</h3>
      <p className="text-gray-400 text-sm mb-6">
        Connect your PayPal account to receive payouts and make purchases on the platform.
      </p>

      {hasPaypal ? (
        /* ── Connected State ── */
        <div className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-black">PayPal Connected</p>
                <span className="text-[10px] bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>
              <p className="text-gray-300 text-xs">{profile.paypal_email}</p>
            </div>
          </div>

          {/* Read-only details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "PayPal Email", value: profile.paypal_email },
              { label: "Account Name", value: profile.paypal_account_name || "Verified Account" },
              { label: "Account Type", value: profile.paypal_account_type === "business" ? "🏢 Business" : "👤 Personal" },
              { label: "Country", value: profile.paypal_country || "Global" },
              { label: "Merchant ID", value: profile.paypal_merchant_id ? profile.paypal_merchant_id.substring(0, 10) + "..." : "N/A" },
              { label: "Status", value: "✓ Verified" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-green-900/30 border border-green-700/30 rounded-xl p-3">
                <p className="text-green-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> {label}
                </p>
                <p className="text-white text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <p className="text-gray-600 text-xs flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Details are read-only. Click "Unlink" to disconnect your account.
          </p>

          {/* Unlink */}
          {!confirmUnlink ? (
            <button
              onClick={() => setConfirmUnlink(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-900/20 border border-red-700/40 text-red-400 text-sm font-bold hover:bg-red-900/30 transition-colors"
            >
              <Unlink className="w-4 h-4" /> Unlink PayPal Account
            </button>
          ) : (
            <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-4 flex items-center justify-between gap-3">
              <p className="text-red-300 text-sm font-semibold">Are you sure? This will disable payouts.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmUnlink(false)} className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700">Cancel</button>
                <button onClick={handleUnlink} disabled={unlinking} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50">
                  {unlinking ? "Unlinking..." : "Yes, Unlink"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Not Connected State ── */
        <div className="bg-blue-900/20 border-2 border-blue-500/40 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm">PP</div>
            <div>
              <p className="text-white font-black">PayPal</p>
              <p className="text-gray-400 text-xs">Receive earnings & payouts worldwide</p>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700/40 rounded-xl p-4 text-xs text-gray-400 space-y-1">
            <p className="text-blue-300 font-bold mb-2">How to connect</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Visit <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">paypal.com</a> and log in</li>
              <li>Copy your registered PayPal email address</li>
              <li>Paste it below and click "Connect PayPal"</li>
            </ol>
          </div>

          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Your PayPal Email</label>
            <input
              type="email"
              value={paypalEmail}
              onChange={e => setPaypalEmail(e.target.value)}
              placeholder="your@paypal.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={saving || !paypalEmail.includes("@")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? "Connecting..." : "🔗 Connect PayPal"}
          </button>
        </div>
      )}
    </div>
  );
}