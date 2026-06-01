import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Heart, ShoppingCart, ClipboardList, Store, BarChart2, Shield, Package, CreditCard, Upload, User, MessageCircle, Wand2, Radio, Trophy, Star, GitBranch, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import GamerCheckmark from "@/components/shared/GamerCheckmark";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import { Link, useLocation } from "react-router-dom";
import CartDropdown from "@/components/layout/CartDropdown";
import FavoritesDropdown from "@/components/layout/FavoritesDropdown";
import UserMegaMenu from "@/components/layout/UserMegaMenu";
import GlobalSearchBar from "@/components/layout/GlobalSearchBar";
import NotificationBell from "@/components/notifications/NotificationBell";
import LanguageSelector from "@/components/layout/LanguageSelector";
import EarnNowButton from "@/components/shared/EarnNowButton";

export const SIDEBAR_WIDTH = 220;
export const SIDEBAR_COLLAPSED_WIDTH = 56;

export default function AuthNavbar({ user, profile }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar_collapsed") === "true"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const admin = isAdmin(user?.email);
  const accountType = profile?.account_type || "regular";

  useEffect(() => {
    if (user?.email) {
      base44.entities.Cart.filter({ user_email: user.email }).then((r) => setCartCount(r.length));
      base44.entities.Favorite.filter({ user_email: user.email }).then((r) => setFavCount(r.length));
    }
  }, [user]);

  const toggleCollapsed = () => {
    setCollapsed(v => {
      localStorage.setItem("sidebar_collapsed", String(!v));
      return !v;
    });
  };

  const regularLinks = [
    { icon: Star, label: "Favourites", badge: favCount, action: () => { setFavOpen(true); setCartOpen(false); } },
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
    { icon: GitBranch, label: "Routing", href: "/routing-dashboard" },
    { icon: Trophy, label: "Tournaments", href: "/tournaments" },
  ];

  const navLinks = admin ? adminLinks : (accountType === "digital_creator" || accountType === "business") ? sellerLinks : regularLinks;

  const extraLinks = [
    { icon: User, label: "My Channel", href: "/profile" },
    { icon: Wand2, label: "Studio", href: "/ai-video-studio", badge: "NEW", badgeColor: "bg-pink-500/30 text-pink-300" },
    ...(admin || accountType === "digital_creator" || accountType === "business" ? [{ icon: Upload, label: "Add Listing", href: "/create-listing" }] : []),
    { icon: Radio, label: "Go Live", href: "/studio", dot: true },
    { icon: MessageCircle, label: "Messages", href: "/messages" },
  ];

  const w = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-2 px-3 py-4 border-b border-purple-900/30 ${collapsed && !isMobile ? "justify-center" : ""}`}>
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0"
            animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 3 }}
          >
            <Gamepad2 className="w-5 h-5 text-white" />
          </motion.div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-black text-white text-xs whitespace-nowrap">
                GAMER<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">.PROD</span>
              </span>
              {(profile?.is_verified || isAdmin(user?.email)) && (
                <span className="flex items-center gap-1">
                  <GamerCheckmark isVerified={profile?.is_verified} userEmail={user?.email} size="sm" showTooltip={false} />
                  <span className={`text-[9px] font-bold ${isAdmin(user?.email) ? "text-yellow-400" : "text-purple-400"}`}>Verified</span>
                </span>
              )}
            </div>
          )}
        </Link>
        {!isMobile && (
          <button onClick={toggleCollapsed} className="ml-auto p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all flex-shrink-0">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Search */}
      {(!collapsed || isMobile) && (
        <div className="px-3 py-2 border-b border-purple-900/20">
          <GlobalSearchBar compact />
        </div>
      )}

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        {/* Divider label */}
        {(!collapsed || isMobile) && (
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest px-2 py-1">Navigation</p>
        )}
        {navLinks.map((link, i) => {
          const isActive = link.href && location.pathname + location.search === link.href;
          const cls = `relative flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm font-semibold transition-all group ${
            isActive ? "bg-purple-900/50 text-purple-200 border border-purple-700/50" : "text-gray-400 hover:text-white hover:bg-gray-800/70"
          } ${collapsed && !isMobile ? "justify-center" : ""}`;
          return link.action ? (
            <button key={i} onClick={link.action} className={cls} title={collapsed && !isMobile ? link.label : ""}>
              <link.icon className="w-4 h-4 flex-shrink-0" />
              {(!collapsed || isMobile) && <span className="truncate">{link.label}</span>}
              {link.badge > 0 && (
                <span className={`${collapsed && !isMobile ? "absolute -top-0.5 -right-0.5" : "ml-auto"} w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold`}>
                  {link.badge}
                </span>
              )}
            </button>
          ) : (
            <Link key={i} to={link.href} className={cls} title={collapsed && !isMobile ? link.label : ""}>
              <link.icon className="w-4 h-4 flex-shrink-0" />
              {(!collapsed || isMobile) && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="nav-divider mx-2 my-2" />

        {(!collapsed || isMobile) && (
          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest px-2 py-1">Tools</p>
        )}
        {extraLinks.map((link, i) => {
          const isActive = link.href && location.pathname === link.href;
          return (
            <Link key={i} to={link.href} title={collapsed && !isMobile ? link.label : ""}
              className={`relative flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive ? "bg-purple-900/50 text-purple-200 border border-purple-700/50" : "text-gray-400 hover:text-white hover:bg-gray-800/70"
              } ${collapsed && !isMobile ? "justify-center" : ""}`}>
              <link.icon className="w-4 h-4 flex-shrink-0" />
              {(!collapsed || isMobile) && <span className="truncate flex-1">{link.label}</span>}
              {link.badge && (!collapsed || isMobile) && (
                <span className={`px-1 py-0.5 rounded text-[9px] font-black ${link.badgeColor}`}>{link.badge}</span>
              )}
              {link.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
            </Link>
          );
        })}
      </div>

      {/* Bottom: earn + language + notifications + profile */}
      <div className={`border-t border-purple-900/30 p-2 space-y-1 ${collapsed && !isMobile ? "flex flex-col items-center" : ""}`}>
        {!admin && (!collapsed || isMobile) && <div className="w-full"><EarnNowButton /></div>}
        <div className={`flex items-center gap-1 ${collapsed && !isMobile ? "flex-col" : "flex-wrap"}`}>
          <LanguageSelector />
          <NotificationBell userEmail={user?.email} />
          <UserMegaMenu user={user} profile={profile} favCount={favCount} cartCount={cartCount}
            onFavOpen={() => setFavOpen(true)} onCartOpen={() => setCartOpen(true)} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left Sidebar */}
      <motion.aside
        animate={{ width: w }}
        transition={{ duration: 0.2 }}
        className="hidden lg:flex fixed top-0 left-0 bottom-0 z-50 flex-col bg-gray-950/98 backdrop-blur-md border-r border-purple-900/30"
        style={{ width: w }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile top bar */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-purple-900/30 h-14 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Gamepad2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-white text-xs">GAMER<span className="text-purple-400">.PROD</span></span>
        </Link>
        <div className="flex-1" />
        <NotificationBell userEmail={user?.email} />
        <UserMegaMenu user={user} profile={profile} favCount={favCount} cartCount={cartCount}
          onFavOpen={() => setFavOpen(true)} onCartOpen={() => setCartOpen(true)} />
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/70" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-gray-950 border-r border-purple-900/30 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900/30">
                <span className="font-black text-white text-sm">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent isMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart & Favorites */}
      <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} userEmail={user?.email} />
      <FavoritesDropdown isOpen={favOpen} onClose={() => setFavOpen(false)} userEmail={user?.email} />
    </>
  );
}