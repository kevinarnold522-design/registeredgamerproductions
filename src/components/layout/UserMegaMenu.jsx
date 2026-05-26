import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, LogOut, Store, BarChart2, Shield, Heart, ShoppingCart,
  ClipboardList, CreditCard, Play, Upload, ChevronRight,
  Package, Settings, X, MessageCircle
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

  const handleLogout = () => base44.auth.logout("/");

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
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-yellow-400 hover:bg-yellow-900/20 text-sm font-semibold transition-colors">
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}

                  <Link to="/payment" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <CreditCard className="w-4 h-4 text-cyan-400" /> Payment
                  </Link>
                  <Link to="/messages" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                    <MessageCircle className="w-4 h-4 text-green-400" /> Messages
                  </Link>

                  <div className="border-t border-gray-800 mt-1 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/20 text-sm font-semibold transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
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