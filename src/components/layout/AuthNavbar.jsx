import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Heart, ShoppingCart, ClipboardList, Settings,
  User, LogOut, ChevronDown, Bell, Store, BarChart2, Shield,
  Star, Package, CreditCard, Upload, X, Play
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin, ACCOUNT_TYPES } from "@/lib/constants";
import { Link, useNavigate } from "react-router-dom";
import CartDropdown from "@/components/layout/CartDropdown";
import FavoritesDropdown from "@/components/layout/FavoritesDropdown";

export default function AuthNavbar({ user, profile }) {
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const menuRef = useRef(null);

  const admin = isAdmin(user?.email);
  const accountType = profile?.account_type || "regular";
  const typeInfo = ACCOUNT_TYPES.find((t) => t.id === accountType);

  useEffect(() => {
    if (user?.email) {
      base44.entities.Cart.filter({ user_email: user.email }).then((r) => setCartCount(r.length));
      base44.entities.Favorite.filter({ user_email: user.email }).then((r) => setFavCount(r.length));
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  const accountLabel = admin ? "⚡ Admin" : typeInfo?.label || "User";
  const accountColor = admin
    ? "text-yellow-400"
    : accountType === "digital_creator"
    ? "text-purple-400"
    : accountType === "business"
    ? "text-green-400"
    : "text-blue-400";

  const regularLinks = [
    { icon: Heart, label: "Favourites", badge: favCount, action: () => { setFavOpen(true); setCartOpen(false); } },
    { icon: ShoppingCart, label: "Cart", badge: cartCount, action: () => { setCartOpen(true); setFavOpen(false); } },
    { icon: ClipboardList, label: "Orders", href: "/dashboard?tab=orders" },
  ];

  const sellerLinks = [
    { icon: Store, label: "My Listings", href: "/dashboard?tab=listings" },
    { icon: BarChart2, label: "Analytics", href: "/dashboard?tab=analytics" },
    { icon: Package, label: "Orders", href: "/dashboard?tab=orders" },
    { icon: CreditCard, label: "Payouts", href: "/dashboard?tab=payouts" },
  ];

  const adminLinks = [
    { icon: Shield, label: "Admin Panel", href: "/dashboard" },
    { icon: BarChart2, label: "Analytics", href: "/dashboard?tab=analytics" },
    { icon: Store, label: "All Listings", href: "/dashboard?tab=listings" },
    { icon: User, label: "Users", href: "/dashboard?tab=users" },
  ];

  const navLinks = admin ? adminLinks : (accountType === "digital_creator" || accountType === "business") ? sellerLinks : regularLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-white text-sm hidden sm:block">
            GAMER<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Productions</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) =>
            link.action ? (
              <button
                key={i}
                onClick={link.action}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-purple-900/20 text-sm font-medium transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
                {link.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            ) : (
              <a
                key={i}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-purple-900/20 text-sm font-medium transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Right: User */}
        <div className="flex items-center gap-2">
          {/* Add Listing for sellers */}
          {(admin || accountType === "digital_creator" || accountType === "business") && (
            <Link
              to="/create-listing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-300 text-sm font-semibold hover:bg-purple-600/30 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Add Listing
            </Link>
          )}

          {/* Profile dropdown */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-700/50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  "🎮"
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-white text-xs font-bold leading-none">{profile?.username || user?.full_name || "Gamer"}</p>
                <p className={`text-[10px] font-semibold leading-none mt-0.5 ${accountColor}`}>{accountLabel}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-purple-900/30 to-pink-900/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl overflow-hidden">
                        {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : "🎮"}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{profile?.username || user?.full_name}</p>
                        <p className={`text-xs font-semibold ${accountColor}`}>{accountLabel}</p>
                        <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    <a href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                      <User className="w-4 h-4" /> My Profile
                    </a>
                    <a href="/channel" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                      <Play className="w-4 h-4" /> My Channel
                    </a>
                    <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                      <BarChart2 className="w-4 h-4" /> Dashboard
                    </a>
                    {accountType === "regular" && (
                      <>
                        <button onClick={() => { setFavOpen(true); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                          <Heart className="w-4 h-4" /> Favourites {favCount > 0 && <span className="ml-auto text-purple-400 font-bold text-xs">{favCount}</span>}
                        </button>
                        <button onClick={() => { setCartOpen(true); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                          <ShoppingCart className="w-4 h-4" /> Cart {cartCount > 0 && <span className="ml-auto text-purple-400 font-bold text-xs">{cartCount}</span>}
                        </button>
                        <a href="/dashboard?tab=orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                          <ClipboardList className="w-4 h-4" /> Transaction & Orders
                        </a>
                      </>
                    )}
                    <a href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </a>
                    {admin && (
                      <a href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-yellow-400 hover:bg-yellow-900/20 text-sm font-semibold transition-colors">
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </a>
                    )}
                    <div className="border-t border-gray-800 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/20 text-sm font-semibold transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cart & Favorites slide-ins */}
      <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} userEmail={user?.email} />
      <FavoritesDropdown isOpen={favOpen} onClose={() => setFavOpen(false)} userEmail={user?.email} />
    </nav>
  );
}