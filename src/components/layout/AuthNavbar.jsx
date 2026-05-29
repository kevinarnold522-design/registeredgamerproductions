import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Heart, ShoppingCart, ClipboardList, Store, BarChart2, Shield, Package, CreditCard, Upload, User, MessageCircle, Wand2, PieChart, Youtube, Facebook, Trophy } from "lucide-react";
import GamerCheckmark from "@/components/shared/GamerCheckmark";
import { base44 } from "@/api/base44Client";
import { isAdmin, ACCOUNT_TYPES } from "@/lib/constants";
import { Link } from "react-router-dom";
import CartDropdown from "@/components/layout/CartDropdown";
import FavoritesDropdown from "@/components/layout/FavoritesDropdown";
import UserMegaMenu from "@/components/layout/UserMegaMenu";
import GlobalSearchBar from "@/components/layout/GlobalSearchBar";
import NotificationBell from "@/components/notifications/NotificationBell";
import LanguageSelector from "@/components/layout/LanguageSelector";

export default function AuthNavbar({ user, profile }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);

  const admin = isAdmin(user?.email);
  const accountType = profile?.account_type || "regular";

  useEffect(() => {
    if (user?.email) {
      base44.entities.Cart.filter({ user_email: user.email }).then((r) => setCartCount(r.length));
      base44.entities.Favorite.filter({ user_email: user.email }).then((r) => setFavCount(r.length));
    }
  }, [user]);

  const regularLinks = [
    { icon: Heart, label: "Favourites", badge: favCount, action: () => { setFavOpen(true); setCartOpen(false); } },
    { icon: ShoppingCart, label: "Cart", badge: cartCount, action: () => { setCartOpen(true); setFavOpen(false); } },
    { icon: Trophy, label: "Tournaments", href: "/tournaments" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    { icon: ClipboardList, label: "Orders", href: "/dashboard?tab=orders" },
  ];

  const sellerLinks = [
    { icon: Store, label: "My Listings", href: "/dashboard?tab=listings" },
    { icon: BarChart2, label: "Sales", href: "/dashboard?tab=sales" },
    { icon: Package, label: "Orders", href: "/dashboard?tab=orders" },
    { icon: CreditCard, label: "Payment", href: "/payment" },
  ];

  const adminLinks = [
    { icon: Shield, label: "Admin Panel", href: "/dashboard" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
    { icon: Store, label: "All Listings", href: "/dashboard?tab=listings" },
    { icon: User, label: "Users", href: "/dashboard?tab=users" },
    { icon: Trophy, label: "Tournaments", href: "/tournaments" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
  ];

  const navLinks = admin ? adminLinks : (accountType === "digital_creator" || accountType === "business") ? sellerLinks : regularLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"
            animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 3 }}
          >
            <Gamepad2 className="w-5 h-5 text-white" />
          </motion.div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-black text-white text-sm">
              GAMER<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">.PRODUCTIONS</span>
            </span>
            {(profile?.is_verified || isAdmin(user?.email)) && (
              <span className="flex items-center gap-1">
                <GamerCheckmark isVerified={profile?.is_verified} userEmail={user?.email} size="sm" showTooltip={false} />
                <span className={`text-[10px] font-bold ${isAdmin(user?.email) ? "text-yellow-400" : "text-purple-400"}`}>Verified</span>
              </span>
            )}
          </div>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-sm mx-4">
          <GlobalSearchBar />
        </div>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link, i) =>
            link.action ? (
              <button
                key={i}
                onClick={link.action}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-300 hover:text-purple-200 text-sm font-semibold transition-all glass-3d-btn"
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
              <Link
                key={i}
                to={link.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-300 hover:text-purple-200 text-sm font-semibold transition-all glass-3d-btn"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Right: User */}
        <div className="flex items-center gap-2">
          {/* My Channel/Profile */}
          <Link to="/profile" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-300 text-sm font-bold hover:text-purple-200 transition-all glass-3d-btn">
            <User className="w-4 h-4" />
            <span className="hidden lg:block">My Channel</span>
          </Link>
          {/* AI Video Studio — for all logged-in users */}
          <Link
            to="/ai-video-studio"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-purple-300 text-sm font-bold transition-all glass-3d-btn"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))", border: "1px solid rgba(167,85,247,0.35)" }}
          >
            <Wand2 className="w-4 h-4" />
            <span className="hidden lg:block">Studio</span>
            <span className="px-1 py-0.5 rounded text-[9px] bg-pink-500/30 text-pink-300 font-black">NEW</span>
          </Link>
          {/* Add Listing for sellers */}
          {(admin || accountType === "digital_creator" || accountType === "business") && (
            <Link
              to="/create-listing"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-purple-300 text-sm font-semibold transition-all glass-3d-btn"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(124,58,237,0.1))", border: "1px solid rgba(124,58,237,0.35)" }}
            >
              <Upload className="w-4 h-4" />
              Add Listing
            </Link>
          )}
          {/* Language Selector */}
          <LanguageSelector />
          {/* Messages */}
          <Link to="/messages" className="relative flex items-center justify-center w-9 h-9 rounded-xl glass-3d-btn text-gray-400 hover:text-purple-300 transition-all">
            <MessageCircle className="w-4 h-4" />
          </Link>
          {/* Notifications */}
          <NotificationBell userEmail={user?.email} />
          {/* Mega menu profile button */}
          <UserMegaMenu
            user={user}
            profile={profile}
            favCount={favCount}
            cartCount={cartCount}
            onFavOpen={() => setFavOpen(true)}
            onCartOpen={() => setCartOpen(true)}
          />
        </div>
      </div>

      {/* Cart & Favorites slide-ins */}
      <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} userEmail={user?.email} />
      <FavoritesDropdown isOpen={favOpen} onClose={() => setFavOpen(false)} userEmail={user?.email} />
    </nav>
  );
}