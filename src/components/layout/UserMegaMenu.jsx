import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, LogOut, Store, BarChart2, Shield, Heart, ShoppingCart,
  ClipboardList, CreditCard, Play, Upload, ChevronRight,
  Package, Settings, X, CheckCircle, ExternalLink, Gamepad2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin, ACCOUNT_TYPES } from "@/lib/constants";
import GamerCheckmark from "@/components/shared/GamerCheckmark";

const PAYMENT_METHODS = [
  { id: "paypal", name: "PayPal", icon: "🅿️", url: "https://www.paypal.com/signin", color: "text-blue-400", bg: "bg-blue-900/20 border-blue-700/40" },
  { id: "stripe", name: "Stripe", icon: "💳", url: "https://stripe.com/", color: "text-purple-400", bg: "bg-purple-900/20 border-purple-700/40" },
  { id: "wise", name: "Wise", icon: "🌍", url: "https://wise.com/", color: "text-green-400", bg: "bg-green-900/20 border-green-700/40" },
  { id: "payoneer", name: "Payoneer", icon: "💰", url: "https://www.payoneer.com/", color: "text-orange-400", bg: "bg-orange-900/20 border-orange-700/40" },
  { id: "skrill", name: "Skrill", icon: "⚡", url: "https://www.skrill.com/", color: "text-pink-400", bg: "bg-pink-900/20 border-pink-700/40" },
  { id: "crypto", name: "Crypto", icon: "₿", url: "https://www.binance.com/", color: "text-amber-400", bg: "bg-amber-900/20 border-amber-700/40" },
];

export default function UserMegaMenu({ user, profile, favCount, cartCount, onFavOpen, onCartOpen }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("main");
  const [paypalEmail, setPaypalEmail] = useState(profile?.paypal_email || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const admin = isAdmin(user?.email);
  const accountType = profile?.account_type || "regular";
  const typeInfo = ACCOUNT_TYPES.find((t) => t.id === accountType);
  const isSeller = accountType === "digital_creator" || accountType === "business";

  const accountLabel = admin ? "CEO & President" : typeInfo?.label || "User";
  const accountColor = admin ? "text-yellow-400" : isSeller ? "text-purple-400" : "text-blue-400";

  const handleLogout = () => base44.auth.logout("/");

  const savePayPal = async () => {
    if (!paypalEmail.trim() || !profile?.id) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, { paypal_email: paypalEmail, payout_method: "paypal" });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-700/50 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm overflow-hidden">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : "🎮"}
        </div>
        <div className="hidden sm:block text-left">
          <div className="flex items-center gap-1">
            <p className="text-white text-xs font-bold leading-none">{profile?.username || user?.full_name || "Gamer"}</p>
            <GamerCheckmark accountType={accountType} isVerified={profile?.is_verified} userEmail={user?.email} size="sm" showTooltip={false} />
          </div>
          <p className={`text-[10px] font-semibold leading-none mt-0.5 ${accountColor}`}>{accountLabel}</p>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              className="absolute right-0 top-full mt-2 z-50 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
              style={{ width: activeSection === "payment" ? 420 : 280 }}
            >
              {/* Profile Header */}
              <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-purple-900/30 to-pink-900/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl overflow-hidden">
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : "🎮"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-white font-bold text-sm">{profile?.username || user?.full_name}</p>
                      <GamerCheckmark accountType={accountType} isVerified={profile?.is_verified} userEmail={user?.email} size="md" />
                    </div>
                    <p className={`text-xs font-semibold ${accountColor}`}>{accountLabel}</p>
                    <p className="text-gray-500 text-[10px] truncate max-w-[150px]">{user?.email}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Sections */}
              {activeSection === "main" && (
                <div className="p-2">
                  {/* Quick nav */}
                  <a href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <User className="w-4 h-4 text-blue-400" /> My Profile
                  </a>
                  <a href="/channel" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <Play className="w-4 h-4 text-red-400" /> My Channel
                  </a>
                  <a href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <BarChart2 className="w-4 h-4 text-purple-400" /> Dashboard
                  </a>
                  <a href="/checkout" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <ShoppingCart className="w-4 h-4 text-green-400" /> Checkout
                  </a>

                  {/* Buyer extras */}
                  {accountType === "regular" && (
                    <>
                      <button onClick={() => { onFavOpen(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <Heart className="w-4 h-4 text-pink-400" /> Favourites
                        {favCount > 0 && <span className="ml-auto text-pink-400 font-bold text-xs">{favCount}</span>}
                      </button>
                      <button onClick={() => { onCartOpen(); setOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <ShoppingCart className="w-4 h-4 text-green-400" /> Cart
                        {cartCount > 0 && <span className="ml-auto text-green-400 font-bold text-xs">{cartCount}</span>}
                      </button>
                      <a href="/dashboard?tab=orders" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <ClipboardList className="w-4 h-4 text-yellow-400" /> Orders & History
                      </a>
                    </>
                  )}

                  {/* Seller extras */}
                  {isSeller && (
                    <>
                      <a href="/dashboard?tab=listings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <Store className="w-4 h-4 text-purple-400" /> My Listings
                      </a>
                      <a href="/dashboard?tab=analytics" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <BarChart2 className="w-4 h-4 text-green-400" /> Analytics
                      </a>
                      <a href="/dashboard?tab=orders" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <Package className="w-4 h-4 text-blue-400" /> Orders
                      </a>
                      <a href="/create-listing" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <Upload className="w-4 h-4 text-pink-400" /> Add New Listing
                      </a>
                    </>
                  )}

                  {/* Admin */}
                  {admin && (
                    <a href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-yellow-400 hover:bg-yellow-900/20 text-sm font-semibold transition-colors">
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </a>
                  )}

                  {/* Payment Methods — enter inline panel */}
                  <button
                    onClick={() => setActiveSection("payment")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-cyan-400" /> Payment Methods
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-600" />
                  </button>

                  <a href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" /> Settings
                  </a>

                  <div className="border-t border-gray-800 mt-1 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/20 text-sm font-semibold transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Methods Panel */}
              {activeSection === "payment" && (
                <div className="p-3">
                  <button onClick={() => setActiveSection("main")} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-semibold mb-3 transition-colors">
                    ← Back to Menu
                  </button>
                  <h4 className="text-white font-black text-sm mb-3">💳 Payment Methods</h4>

                  {/* PayPal link input */}
                  <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🅿️</span>
                      <div>
                        <p className="text-white font-bold text-xs">PayPal</p>
                        <p className="text-gray-400 text-[10px]">Link your PayPal to receive payouts</p>
                      </div>
                      {profile?.paypal_email && <span className="ml-auto text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold">✓ Linked</span>}
                    </div>
                    <input
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="your@paypal.com"
                      type="email"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-blue-500 mb-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={savePayPal} disabled={saving || !paypalEmail.trim()}
                        className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-40">
                        {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Email"}
                      </button>
                      <a href="https://www.paypal.com/signin" target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition-colors">
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Other payment methods */}
                  <div className="space-y-1.5">
                    {PAYMENT_METHODS.filter(m => m.id !== "paypal").map((m) => (
                      <div key={m.id} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${m.bg}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{m.icon}</span>
                          <span className={`text-xs font-bold ${m.color}`}>{m.name}</span>
                        </div>
                        <a href={m.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-700 transition-colors font-semibold">
                          Open <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-600 text-[10px] mt-3 leading-relaxed">
                    💡 Use Wise or Payoneer to receive internationally, then transfer to your local bank (GCash, BDO, BPI, Maya).
                  </p>

                  <div className="border-t border-gray-800 mt-3 pt-2">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-900/20 text-xs font-semibold transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}