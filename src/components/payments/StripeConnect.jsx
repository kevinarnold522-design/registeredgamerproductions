import React, { useState } from "react";
import { CheckCircle, Unlink, Lock, Eye, EyeOff, Info, CreditCard } from "lucide-react";
import { base44 } from "@/api/base44Client";

const CURRENCIES = ["usd", "eur", "gbp", "php", "aud", "cad", "sgd", "myr", "inr"];

const emptyForm = {
  stripe_account_id: "",
  stripe_publishable_key: "",
  stripe_secret_key: "",
  stripe_webhook_secret: "",
  stripe_business_name: "",
  stripe_country: "",
  stripe_currency: "usd",
};

export default function StripeConnect({ profile, onProfileUpdate }) {
  const isConnected = !!(profile?.stripe_connected && profile?.stripe_publishable_key);

  const [form, setForm] = useState({
    stripe_account_id: profile?.stripe_account_id || "",
    stripe_publishable_key: profile?.stripe_publishable_key || "",
    stripe_secret_key: profile?.stripe_secret_key || "",
    stripe_webhook_secret: profile?.stripe_webhook_secret || "",
    stripe_business_name: profile?.stripe_business_name || "",
    stripe_country: profile?.stripe_country || "",
    stripe_currency: profile?.stripe_currency || "usd",
  });

  const [isEditing, setIsEditing] = useState(!isConnected);
  const [saving, setSaving] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const handleConnect = async () => {
    if (!form.stripe_publishable_key.trim() || !form.stripe_secret_key.trim()) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, {
      ...form,
      stripe_connected: true,
    });
    onProfileUpdate({ ...profile, ...form, stripe_connected: true });
    setIsEditing(false);
    setSaving(false);
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    const cleared = {
      stripe_account_id: null,
      stripe_publishable_key: null,
      stripe_secret_key: null,
      stripe_webhook_secret: null,
      stripe_business_name: null,
      stripe_country: null,
      stripe_currency: "usd",
      stripe_connected: false,
    };
    await base44.entities.UserProfile.update(profile.id, cleared);
    onProfileUpdate({ ...profile, ...cleared });
    setForm({ ...emptyForm });
    setConfirmUnlink(false);
    setUnlinking(false);
    setIsEditing(true);
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    disabled: !isEditing,
    className: `w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm font-mono ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`,
  });

  return (
    <div className={`rounded-2xl p-6 space-y-4 ${isConnected ? "bg-purple-900/10 border-2 border-purple-500/40" : "bg-gray-900/60 border-2 border-gray-700/60"}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm ${isConnected ? "bg-purple-600" : "bg-gray-700"}`}>
          {isConnected ? <CheckCircle className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-white font-black">Stripe</p>
            {isConnected && <span className="text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-bold">Connected ✓</span>}
          </div>
          <p className="text-gray-400 text-xs">{isConnected ? profile.stripe_business_name || "Stripe Account Active" : "Accept card payments worldwide"}</p>
        </div>
      </div>

      {/* Info banner */}
      {!isConnected && (
        <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-3 flex gap-2">
          <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-gray-400 text-xs leading-relaxed">
            Get your API keys from your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Stripe Dashboard → Developers → API Keys</a>. Your secret key is stored securely and never exposed to buyers.
          </p>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Business / Account Name *</label>
          <input {...f("stripe_business_name")} placeholder="Your business or display name" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Country</label>
            <input {...f("stripe_country")} placeholder="e.g. Philippines" className={f("stripe_country").className.replace("font-mono", "")} />
          </div>
          <div>
            <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Currency</label>
            <select
              value={form.stripe_currency}
              onChange={(e) => setForm((p) => ({ ...p, stripe_currency: e.target.value }))}
              disabled={!isEditing}
              className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm ${!isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
            Publishable Key * <span className="text-gray-600 font-normal normal-case tracking-normal">(starts with pk_)</span>
          </label>
          <input {...f("stripe_publishable_key")} placeholder="pk_live_xxxxxxxxxxxx" />
        </div>

        <div>
          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
            Secret Key * <span className="text-red-400 text-[10px]">(stored securely)</span>
          </label>
          <div className="relative">
            <input
              {...f("stripe_secret_key")}
              type={showSecret ? "text" : "password"}
              placeholder="sk_live_xxxxxxxxxxxx"
              className={f("stripe_secret_key").className + " pr-10"}
            />
            <button type="button" onClick={() => setShowSecret((v) => !v)} disabled={!isEditing}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 disabled:opacity-30">
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
            Webhook Secret <span className="text-gray-600 font-normal normal-case tracking-normal">(optional, starts with whsec_)</span>
          </label>
          <div className="relative">
            <input
              {...f("stripe_webhook_secret")}
              type={showWebhookSecret ? "text" : "password"}
              placeholder="whsec_xxxxxxxxxxxx"
              className={f("stripe_webhook_secret").className + " pr-10"}
            />
            <button type="button" onClick={() => setShowWebhookSecret((v) => !v)} disabled={!isEditing}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 disabled:opacity-30">
              {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Stripe Account ID <span className="text-gray-600 font-normal normal-case tracking-normal">(optional, starts with acct_)</span></label>
          <input {...f("stripe_account_id")} placeholder="acct_xxxxxxxxxxxx" />
        </div>
      </div>

      {/* Action buttons */}
      {isEditing ? (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleConnect}
            disabled={saving || !form.stripe_publishable_key.trim() || !form.stripe_secret_key.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-40"
          >
            <CheckCircle className="w-4 h-4" />
            {saving ? "Connecting..." : isConnected ? "Save Changes" : "Connect Stripe"}
          </button>
          {isConnected && (
            <button onClick={() => { setForm({ stripe_account_id: profile?.stripe_account_id || "", stripe_publishable_key: profile?.stripe_publishable_key || "", stripe_secret_key: profile?.stripe_secret_key || "", stripe_webhook_secret: profile?.stripe_webhook_secret || "", stripe_business_name: profile?.stripe_business_name || "", stripe_country: profile?.stripe_country || "", stripe_currency: profile?.stripe_currency || "usd" }); setIsEditing(false); }}
              className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-bold hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" /> Details locked
          </div>
          {!confirmUnlink ? (
            <button onClick={() => setConfirmUnlink(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-900/20 border border-red-700/40 text-red-400 text-sm font-bold hover:bg-red-900/30 transition-colors">
              <Unlink className="w-4 h-4" /> Unlink Stripe
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-red-300 text-xs font-semibold">Disconnect Stripe?</p>
              <button onClick={() => setConfirmUnlink(false)} className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-bold">Cancel</button>
              <button onClick={handleUnlink} disabled={unlinking} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50">
                {unlinking ? "Unlinking..." : "Confirm"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* How to guide */}
      {!isConnected && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-400 space-y-1">
          <p className="text-white font-bold mb-2">📖 How to get your Stripe keys</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">stripe.com</a> and create an account</li>
            <li>Navigate to <strong className="text-white">Developers → API Keys</strong></li>
            <li>Copy your <strong className="text-white">Publishable key</strong> (pk_live_...) and <strong className="text-white">Secret key</strong> (sk_live_...)</li>
            <li>For webhooks: go to <strong className="text-white">Developers → Webhooks</strong> and create an endpoint</li>
          </ol>
        </div>
      )}
    </div>
  );
}