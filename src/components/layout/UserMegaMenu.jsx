import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, LogOut, Store, BarChart2, Shield, Heart, ShoppingCart,
  ClipboardList, CreditCard, Play, Upload, ChevronRight,
  Package, Settings, X, MessageCircle, Edit3
} from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { isAdmin, ACCOUNT_TYPES } from "@/lib/constants";
import GamerCheckmark from "@/components/shared/GamerCheckmark";

export default function UserMegaMenu({ user, profile, favCount, cartCount, onFavOpen, onCartOpen }) {
  const [open, setOpen] = useState(false);

  const admin = isAdmin(user?.email);
  const accountType = profile?.account_type || "regular";
  const typeInfo = ACCOUNT_TYPES.find((t) => t.id === accountType);
  const isSeller = accountType === "digital_creator" || accountType === "business";

  const accountLabel = admin ? "CEO & President" : typeInfo?.label || "User";
  const accountColor = admin ? "text-yellow-400" : isSeller ? "text-purple-400" : "text-blue-400";

  const [showAdBomb, setShowAdBomb] = useState(false);

  const handleLogout = () => {
    // For regular non-privileged users: show ad bombardment then fake signout
    const isPrivileged = admin || profile?.account_type !== "regular";
    if (!isPrivileged) {
      setShowAdBomb(true);
      // Actually log them out after 8 seconds (after ad bombardment)
      setTimeout(() => {
        base44.auth.logout("/");
      }, 8000);
      return;
    }
    base44.auth.logout("/");
  };

  return (
    <div className="relative">
      {/* Ad Bombardment overlay for regular users on signout */}
      <AnimatePresence>
        {showAdBomb && (
          <motion.div className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.97)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-center mb-6">
              <p className="text-white font-black text-2xl mb-2">Wait! Before you go... 👋</p>
              <p className="text-gray-400 text-sm">Signing you out in a moment...</p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-lg w-full px-4">
              <div className="bg-purple-900/40 border border-purple-700/50 rounded-2xl p-4 text-center">
                <p className="text-4xl mb-2">🎮</p>
                <p className="text-white font-bold text-sm">Upgrade to Tier 1</p>
                <p className="text-purple-300 text-xs mt-1">$1/year — Ad-free + Post in communities!</p>
              </div>
              <div className="bg-pink-900/40 border border-pink-700/50 rounded-2xl p-4 text-center">
                <p className="text-4xl mb-2">💰</p>
                <p className="text-white font-bold text-sm">$10 USD Reward!</p>
                <p className="text-pink-300 text-xs mt-1">Log in 365 days straight to earn real money!</p>
              </div>
              <div className="bg-blue-900/40 border border-blue-700/50 rounded-2xl p-4 text-center">
                <p className="text-4xl mb-2">📘</p>
                <p className="text-white font-bold text-sm">Follow our Facebook</p>
                <a href="https://www.facebook.com/share/1D9ey9w8Rw/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-blue-300 text-xs mt-1 block hover:text-blue-200">GAMER.Productions →</a>
              </div>
              <div className="bg-red-900/40 border border-red-700/50 rounded-2xl p-4 text-center">
                <p className="text-4xl mb-2">▶️</p>
                <p className="text-white font-bold text-sm">Subscribe YouTube</p>
                <a href="https://youtube.com/@registeredgamerproductions?si=WfWn2yT15uvp5LnF" target="_blank" rel="noopener noreferrer" className="text-red-300 text-xs mt-1 block hover:text-red-200">@registeredgamerproductions →</a>
              </div>
            </div>
            <p className="text-gray-600 text-xs mt-6 animate-pulse">Signing out automatically...</p>
          </motion.div>
        )}
      </AnimatePresence>
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
              style={{ width: 280 }}
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
              <div className="p-2">
                  {/* Quick nav */}
                  <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <User className="w-4 h-4 text-blue-400" /> My Profile
                  </Link>
                  <Link to="/channel" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <Play className="w-4 h-4 text-red-400" /> My Channel
                  </Link>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <BarChart2 className="w-4 h-4 text-purple-400" /> Dashboard
                  </Link>
                  <Link to="/checkout" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <ShoppingCart className="w-4 h-4 text-green-400" /> Checkout
                  </Link>

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
                      <Link to="/dashboard?tab=orders" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <ClipboardList className="w-4 h-4 text-yellow-400" /> Orders & History
                      </Link>
                    </>
                  )}

                  {/* Seller extras */}
                  {isSeller && (
                    <>
                      <Link to="/dashboard?tab=listings" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <Store className="w-4 h-4 text-purple-400" /> My Listings
                      </Link>
                      <Link to="/dashboard?tab=analytics" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <BarChart2 className="w-4 h-4 text-green-400" /> Analytics
                      </Link>
                      <Link to="/dashboard?tab=orders" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <Package className="w-4 h-4 text-blue-400" /> Orders
                      </Link>
                      <Link to="/create-listing" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                        <Upload className="w-4 h-4 text-pink-400" /> Add New Listing
                      </Link>
                    </>
                  )}

                  {/* Admin */}
                  {admin && (
                    <>
                      <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-yellow-400 hover:bg-yellow-900/20 text-sm font-semibold transition-colors">
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                      <Link to="/admin-editor" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-yellow-300 hover:bg-yellow-900/20 text-sm font-semibold transition-colors">
                        <Settings className="w-4 h-4" /> Website Editor
                      </Link>
                    </>
                  )}

                  <Link to="/payment" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <CreditCard className="w-4 h-4 text-cyan-400" /> Payment
                  </Link>
                  <Link to="/messages" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <MessageCircle className="w-4 h-4 text-green-400" /> Messages
                  </Link>

                  <div className="border-t border-gray-800 mt-1 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/20 text-sm font-semibold transition-colors">
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}