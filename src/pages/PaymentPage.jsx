import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { CheckCircle, Unlink, Lock, Wallet, Eye, EyeOff, Info, Pencil } from "lucide-react";
import StripeConnect from "@/components/payments/StripeConnect";
import FeedbackWidget from "@/components/shared/FeedbackWidget";
import AdminPayPalPanel from "@/components/dashboard/AdminPayPalPanel";
import { isAdmin } from "@/lib/constants";

export default function PaymentPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Form fields for sellers
  const [form, setForm] = useState({
    paypal_email: "",
    paypal_merchant_id: "",
    paypal_client_id: "",
    paypal_secret: "",
    paypal_account_name: "",
    paypal_account_type: "personal",
    paypal_country: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [originalForm, setOriginalForm] = useState(null);
  const [stripeEditing, setStripeEditing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      if (!me) { base44.auth.redirectToLogin("/payment"); return; }
      setUser(me);
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        const formData = {
          paypal_email: p.paypal_email || "",
          paypal_merchant_id: p.paypal_merchant_id || "",
          paypal_client_id: p.paypal_client_id || "",
          paypal_secret: p.paypal_secret || "",
          paypal_account_name: p.paypal_account_name || "",
          paypal_account_type: p.paypal_account_type || "personal",
          paypal_country: p.paypal_country || "",
        };
        setForm(formData);
        setOriginalForm(formData);
        setIsEditing(!p.paypal_email); // Only editable if no PayPal connected
      }
      setLoading(false);
    };
    init();
  }, []);

  const isSeller = profile?.account_type === "digital_creator" || profile?.account_type === "business";
  const hasPaypal = !!(profile?.paypal_email);

  const handleConnect = async () => {
    if (!form.paypal_email.includes("@")) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, {
      paypal_email: form.paypal_email,
      paypal_merchant_id: form.paypal_merchant_id || null,
      paypal_client_id: form.paypal_client_id || null,
      paypal_secret: form.paypal_secret || null,
      paypal_account_name: form.paypal_account_name || null,
      paypal_account_type: form.paypal_account_type || "personal",
      paypal_country: form.paypal_country || null,
      payout_method: "paypal",
    });
    setProfile(p => ({ ...p, paypal_email: form.paypal_email, paypal_merchant_id: form.paypal_merchant_id }));
    setOriginalForm({ ...form });
    setIsEditing(false);
    setSaving(false);
  };

  const handleEdit = () => {
    setOriginalForm({ ...form });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm({ ...originalForm });
    setIsEditing(false);
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
    setProfile(p => ({ ...p, paypal_email: null, paypal_merchant_id: null }));
    setUnlinking(false);
    setConfirmUnlink(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <AuthNavbar user={user} profile={profile} />
      <FeedbackWidget userEmail={user?.email} userName={user?.full_name} />
      <div className="pt-24 max-w-xl mx-auto px-4 pb-12">
        <h1 className="text-2xl font-black text-white mb-1">💳 Payment</h1>
        <p className="text-gray-400 text-sm mb-8">
          {isSeller
            ? "Connect your PayPal to receive payouts. 90% of each sale goes directly to you."
            : "Connect your PayPal to make purchases and receive any payouts on the platform."}
        </p>

        {hasPaypal ? (
          <div className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-6 space-y-4">
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

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "PayPal Email", value: form.paypal_email, editable: true },
                { label: "Account Name", value: form.paypal_account_name || "Connected Account", editable: true },
                { label: "Account Type", value: form.paypal_account_type === "business" ? "🏢 Business" : "👤 Personal", field: "paypal_account_type", editable: true },
                { label: "Merchant ID", value: form.paypal_merchant_id ? form.paypal_merchant_id.substring(0, 12) + "..." : "N/A", fullValue: form.paypal_merchant_id, editable: true },
                { label: "Country", value: form.paypal_country || "Global", editable: true },
                { label: "Status", value: "✓ Verified", editable: false },
              ].map(({ label, value, field, editable, fullValue }) => (
                <div key={label} className={`border rounded-xl p-3 ${editable && isEditing ? "bg-gray-800 border-gray-700" : "bg-green-900/30 border-green-700/30"}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${editable && isEditing ? "text-gray-400" : "text-green-400"}`}>
                    {editable && isEditing ? null : <Lock className="w-2.5 h-2.5" />} {label}
                  </p>
                  {editable && isEditing ? (
                    field ? (
                      <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
                        <option value="personal">👤 Personal</option>
                        <option value="business">🏢 Business</option>
                      </select>
                    ) : (
                      <input type={field === "paypal_secret" ? "password" : "text"} value={fullValue || form[field || label.toLowerCase().replace(" ", "_")]}
                        onChange={e => setForm(f => ({ ...f, [field || label.toLowerCase().replace(" ", "_")]: e.target.value }))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 font-mono" />
                    )
                  ) : (
                    <p className="text-white text-sm font-semibold">{value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={handleEdit} disabled={!isEditing}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${isEditing ? "bg-blue-900/20 border border-blue-700/40 text-blue-400 hover:bg-blue-900/30" : "bg-gray-800 border border-gray-700 text-gray-400 cursor-not-allowed"}`}>
                <Lock className="w-4 h-4" /> {isEditing ? "Editing..." : "Edit Details"}
              </button>
              {isEditing && (
                <>
                  <button onClick={handleConnect} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors">
                    <CheckCircle className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-bold hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                </>
              )}
            </div>

            {!confirmUnlink && !isEditing ? (
              <button onClick={() => setConfirmUnlink(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-900/20 border border-red-700/40 text-red-400 text-sm font-bold hover:bg-red-900/30 transition-colors">
                <Unlink className="w-4 h-4" /> Unlink PayPal Account
              </button>
            ) : confirmUnlink && !isEditing ? (
              <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-red-300 text-sm font-semibold">Are you sure? This will disable payouts.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmUnlink(false)} className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700">Cancel</button>
                  <button onClick={handleUnlink} disabled={unlinking} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50">
                    {unlinking ? "Unlinking..." : "Yes, Unlink"}
                  </button>
                </div>
              </div>
            ) : null}

            {isSeller && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-green-900/40">
                <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
                  <p className="text-green-400 text-xs font-bold mb-1">✓ 90% Payouts</p>
                  <p className="text-gray-500 text-[10px]">90% of each sale goes to you</p>
                </div>
                <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
                  <p className="text-green-400 text-xs font-bold mb-1">✓ Secure Payments</p>
                  <p className="text-gray-500 text-[10px]">Powered by PayPal</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-900/20 border-2 border-blue-500/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm">PP</div>
                <div>
                  <p className="text-white font-black">Connect PayPal</p>
                  <p className="text-gray-400 text-xs">Receive earnings & payouts worldwide</p>
                </div>
              </div>

              {isSeller && (
                <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4 flex gap-2">
                  <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-bold text-xs mb-1">Sellers & Creators</p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      To receive automatic payouts, please provide your PayPal Merchant ID and API credentials from your <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">PayPal Developer Dashboard</a>. This enables the platform to route 90% of each payment directly to your PayPal account.
                    </p>
                  </div>
                </div>
              )}

              {/* Always-required: PayPal email */}
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">PayPal Email *</label>
                <input type="email" value={form.paypal_email} onChange={e => setForm(f => ({ ...f, paypal_email: e.target.value }))}
                  placeholder="your@paypal.com"
                  disabled={!isEditing}
                  className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm ${!isEditing && "opacity-50 cursor-not-allowed"}`} />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Account Holder Name</label>
                <input value={form.paypal_account_name} onChange={e => setForm(f => ({ ...f, paypal_account_name: e.target.value }))}
                  placeholder="Full name on your PayPal account"
                  disabled={!isEditing}
                  className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm ${!isEditing && "opacity-50 cursor-not-allowed"}`} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Account Type</label>
                  <select value={form.paypal_account_type} onChange={e => setForm(f => ({ ...f, paypal_account_type: e.target.value }))}
                    disabled={!isEditing}
                    className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm ${!isEditing && "opacity-50 cursor-not-allowed"}`}>
                    <option value="personal">👤 Personal</option>
                    <option value="business">🏢 Business</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Country</label>
                  <input value={form.paypal_country} onChange={e => setForm(f => ({ ...f, paypal_country: e.target.value }))}
                    placeholder="e.g. Philippines"
                    disabled={!isEditing}
                    className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm ${!isEditing && "opacity-50 cursor-not-allowed"}`} />
                </div>
              </div>

              {/* Seller-only: Merchant ID + Client ID + Secret */}
              {isSeller && (
                <div className={`space-y-3 border-t border-gray-700 pt-4 ${!isEditing && "opacity-50"}`}>
                  <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">API Credentials (for automatic payouts)</p>

                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">PayPal Merchant ID</label>
                    <input value={form.paypal_merchant_id} onChange={e => setForm(f => ({ ...f, paypal_merchant_id: e.target.value }))}
                      placeholder="e.g. WHLHPWVX9BAP2 (from PayPal account settings)"
                      disabled={!isEditing}
                      className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm font-mono ${!isEditing && "opacity-50 cursor-not-allowed"}`} />
                    <p className="text-gray-600 text-[10px] mt-1">Found in: PayPal Settings → Account → Merchant ID</p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Client ID (from PayPal Developer)</label>
                    <input value={form.paypal_client_id} onChange={e => setForm(f => ({ ...f, paypal_client_id: e.target.value }))}
                      placeholder="AU69KZ-xxxx..."
                      disabled={!isEditing}
                      className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm font-mono ${!isEditing && "opacity-50 cursor-not-allowed"}`} />
                    <p className="text-gray-600 text-[10px] mt-1">Found at: developer.paypal.com → Apps & Credentials</p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                      Secret ID
                      <span className="text-red-400 text-[10px]">(stored securely)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSecret ? "text" : "password"}
                        value={form.paypal_secret}
                        onChange={e => setForm(f => ({ ...f, paypal_secret: e.target.value }))}
                        placeholder="AU69KZ-xxxx..."
                        disabled={!isEditing}
                        className={`w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm font-mono pr-10 ${!isEditing && "opacity-50 cursor-not-allowed"}`}
                      />
                      <button type="button" onClick={() => setShowSecret(v => !v)}
                        disabled={!isEditing}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 disabled:opacity-30">
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={handleConnect} disabled={saving || !form.paypal_email.includes("@")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
                <Wallet className="w-4 h-4" />
                {saving ? "Connecting..." : "🔗 Connect PayPal"}
              </button>
            </div>

            {/* How to get credentials guide for sellers */}
            {isSeller && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-white font-bold text-sm mb-3">📖 How to Get Your PayPal API Credentials</p>
                <ol className="space-y-2 text-xs text-gray-400 list-decimal list-inside">
                  <li>Go to <a href="https://developer.paypal.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">developer.paypal.com</a> and log in</li>
                  <li>Click <strong className="text-white">Apps & Credentials</strong> in the left menu</li>
                  <li>Create a new App or use an existing one</li>
                  <li>Copy your <strong className="text-white">Client ID</strong> and <strong className="text-white">Secret</strong></li>
                  <li>For Merchant ID: go to <a href="https://www.paypal.com/myaccount/settings/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">PayPal Account Settings</a> → Account Info</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Stripe Section */}
        {profile && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-black text-white">💜 Stripe</h2>
              {profile?.stripe_connected && !stripeEditing && (
                <button
                  onClick={() => setStripeEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/30 border border-purple-600/40 text-purple-300 text-xs font-bold hover:bg-purple-900/50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Stripe
                </button>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4">Connect Stripe to accept card payments from buyers worldwide.</p>
            <StripeConnect
              profile={profile}
              onProfileUpdate={(updated) => { setProfile(updated); setStripeEditing(false); }}
              forceEdit={stripeEditing}
            />
          </div>
        )}

        {/* Admin Platform PayPal — only for admin */}
        {isAdmin(user?.email) && (
          <div className="mt-8">
            <h2 className="text-lg font-black text-white mb-1">🛡️ Admin Platform PayPal</h2>
            <p className="text-gray-400 text-sm mb-4">Platform-level PayPal account for receiving the 10% commission fee.</p>
            <AdminPayPalPanel />
          </div>
        )}
      </div>
    </div>
  );
}