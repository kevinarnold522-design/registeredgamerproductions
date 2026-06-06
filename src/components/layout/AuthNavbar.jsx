import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Heart, ShoppingCart, ClipboardList, Store, BarChart2, Shield,
  Package, CreditCard, Upload, User, MessageCircle, Wand2, Radio, Trophy,
  Star, GitBranch, ChevronLeft, ChevronRight, Menu, X, DollarSign,
  Settings, Share2, LogOut, Globe, Crown, Users, TrendingUp
} from "lucide-react";
import GamerCheckmark from "@/components/shared/GamerCheckmark";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import { Link, useLocation } from "react-router-dom";
import CartDropdown from "@/components/layout/CartDropdown";
import FavoritesDropdown from "@/components/layout/FavoritesDropdown";
import GlobalSearchBar from "@/components/layout/GlobalSearchBar";
import NotificationBell from "@/components/notifications/NotificationBell";
import LanguageSelector from "@/components/layout/LanguageSelector";
import EarnNowButton from "@/components/shared/EarnNowButton";

export const SIDEBAR_WIDTH = 240;
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
  const isSeller = accountType === "digital_creator" || accountType === "business";
  const isMod = profile?.moderator_type === "account_moderator";

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

  const handleLogout = () => {
    base44.auth.logout("/");
  };

  // ── Link groups ──────────────────────────────────────────
  const adminLinks = [
    { icon: Shield, label: "Admin Dashboard", href: "/dashboard", color: "text-yellow-400" },
    { icon: GitBranch, label: "Routing Dashboard", href: "/routing-dashboard", color: "text-cyan-400" },
    { icon: BarChart2, label: "Analytics", href: "/analytics", color: "text-purple-400" },
    { icon: DollarSign, label: "Earnings", href: "/earnings", color: "text-green-400" },
    { icon: TrendingUp, label: "Leaderboard", href: "/leaderboard", color: "text-orange-400" },
    { icon: Trophy, label: "Tournaments", href: "/tournaments", color: "text-pink-400" },
    { icon: Store, label: "All Listings", href: "/dashboard?tab=listings", color: "text-blue-400" },
    { icon: Users, label: "Users", href: "/dashboard?tab=users", color: "text-yellow-300" },
    { icon: Settings, label: "Website Editor", href: "/admin-editor", color: "text-gray-400" },
    { icon: Share2, label: "Social Manager", href: "/social-manager", color: "text-pink-300" },
  ];

  const sellerLinks = [
    { icon: Store, label: "My Listings", href: "/dashboard?tab=listings" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
    { icon: DollarSign, label: "Earnings", href: "/earnings", color: "text-green-400" },
    { icon: Package, label: "Orders", href: "/dashboard?tab=orders" },
    { icon: CreditCard, label: "Payment", href: "/payment" },
    { icon: Trophy, label: "Tournaments", href: "/tournaments" },
    { icon: TrendingUp, label: "Leaderboard", href: "/leaderboard" },
  ];

  const regularLinks = [
    { icon: Star, label: "Favourites", badge: favCount, action: () => { setFavOpen(true); setCartOpen(false); } },
    { icon: ShoppingCart, label: "Cart", badge: cartCount, action: () => { setCartOpen(true); setFavOpen(false); } },
    { icon: ClipboardList, label: "Orders", href: "/dashboard?tab=orders" },
    { icon: Trophy, label: "Tournaments", href: "/tournaments" },
    { icon: TrendingUp, label: "Leaderboard", href: "/leaderboard" },
  ];

  const navLinks = admin ? adminLinks : isSeller ? sellerLinks : regularLinks;

  const toolLinks = [
    { icon: User, label: "My Channel", href: "/profile", color: "text-blue-400" },
    { icon: Wand2, label: "AI Studio", href: "/ai-video-studio", badge: "NEW", badgeColor: "bg-pink-500/30 text-pink-300" },
    ...(admin || isSeller ? [{ icon: Upload, label: "Add Listing", href: "/create-listing", color: "text-green-400" }] : []),
    { icon: Radio, label: "Go Live", href: "/studio", dot: true, color: "text-red-400" },
    { icon: MessageCircle, label: "Messages", href: "/messages" },
    { icon: Globe, label: "Communities", href: "/gaming-community", color: "text-cyan-400" },
  ];

  const w = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const NavLink = ({ link, i, isMobile = false }) => {
    const show = !collapsed || isMobile;
    const isActive = link.href && (location.pathname + location.search === link.href || location.pathname === link.href?.split("?")[0]);
    const cls = `relative flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-sm font-semibold transition-all group
      ${isActive ? "bg-purple-900/50 text-purple-200 border border-purple-700/50" : "text-gray-400 hover:text-white hover:bg-gray-800/70"}
      ${collapsed && !isMobile ? "justify-center" : ""}`;

    const content = (
      <>
        <link.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-purple-300" : (link.color || "")}`} />
        {show && <span className="truncate flex-1">{link.label}</span>}
        {link.badge > 0 && (
          <span className={`${collapsed && !isMobile ? "absolute -top-0.5 -right-0.5" : "ml-auto"} w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold`}>
            {link.badge}
          </span>
        )}
        {link.badge && typeof link.badge === "string" && show && (
          <span className={`px-1 py-0.5 rounded text-[9px] font-black ${link.badgeColor}`}>{link.badge}</span>
        )}
        {link.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
      </>
    );

    if (link.action) return <button key={i} onClick={link.action} className={cls} title={!show ? link.label : ""}>{content}</button>;
    return <Link key={i} to={link.href} className={cls} title={!show ? link.label : ""}>{content}</Link>;
  };

  const SidebarContent = ({ isMobile = false }) => {
    const show = !collapsed || isMobile;
    return (
      <div className="flex flex-col h-full">

        {/* ── Profile at TOP ── */}
        <div className={`px-3 pt-4 pb-3 border-b border-purple-900/30 ${collapsed && !isMobile ? "flex flex-col items-center gap-2" : ""}`}>
          <Link to="/profile" className={`flex items-center gap-3 rounded-xl p-2 hover:bg-gray-800/60 transition-all ${collapsed && !isMobile ? "justify-center p-1" : ""}`}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                  : <User className="w-5 h-5 text-white" />
                }
              </div>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-gray-950" />
            </div>
            {show && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-black text-xs truncate">{profile?.username || user?.full_name || "Gamer"}</p>
                  <GamerCheckmark isVerified={profile?.is_verified} userEmail={user?.email} size="sm" showTooltip={false} />
                </div>
                <p className={`text-[10px] font-semibold truncate ${admin ? "text-yellow-400" : isSeller ? "text-purple-400" : "text-blue-400"}`}>
                  {admin ? "CEO & President" : isSeller ? accountType.replace("_", " ") : "Gamer"}
                </p>
              </div>
            )}
          </Link>

          {/* CEO Crown for admin */}
          {admin && show && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-900/30 border border-yellow-700/30 mt-1">
              <Crown className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-[10px] font-black">CEO & President</span>
            </div>
          )}

          {/* Collapse toggle & logo */}
          <div className={`flex items-center gap-2 mt-2 ${collapsed && !isMobile ? "flex-col" : ""}`}>
            <Link to="/" className="flex items-center gap-1.5 min-w-0">
              <motion.div
                className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0"
                animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 4 }}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-white" />
              </motion.div>
              {show && <span className="font-black text-white text-[10px] whitespace-nowrap">Gamer<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">.Productions</span></span>}
            </Link>
            {!isMobile && (
              <button onClick={toggleCollapsed} className="ml-auto p-1 rounded-lg text-gray-600 hover:text-white hover:bg-gray-800 transition-all flex-shrink-0">
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {show && (
          <div className="px-3 py-2 border-b border-purple-900/20">
            <GlobalSearchBar compact />
          </div>
        )}

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {show && <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest px-2 py-1">{admin ? "Admin" : "Dashboard"}</p>}
          {navLinks.map((link, i) => <NavLink key={i} link={link} i={i} isMobile={isMobile} />)}

          <div className="nav-divider mx-2 my-1.5" />

          {show && <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest px-2 py-1">Tools</p>}
          {toolLinks.map((link, i) => <NavLink key={i} link={link} i={i} isMobile={isMobile} />)}
        </div>

        {/* Bottom */}
        <div className={`border-t border-purple-900/30 p-2 space-y-1.5 ${collapsed && !isMobile ? "flex flex-col items-center" : ""}`}>
          {!admin && show && <EarnNowButton />}
          <div className={`flex items-center gap-1 flex-wrap ${collapsed && !isMobile ? "flex-col" : ""}`}>
            <LanguageSelector />
            <NotificationBell userEmail={user?.email} />
            <button onClick={() => { setFavOpen(true); }} className={`relative flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-xs font-semibold ${collapsed && !isMobile ? "justify-center" : ""}`} title="Favourites">
              <Star className="w-4 h-4 text-yellow-400" />
              {show && <span>Favs</span>}
              {favCount > 0 && <span className="w-4 h-4 rounded-full bg-yellow-500 text-black text-[9px] flex items-center justify-center font-black">{favCount}</span>}
            </button>
            <button onClick={() => { setCartOpen(true); }} className={`relative flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-xs font-semibold ${collapsed && !isMobile ? "justify-center" : ""}`} title="Cart">
              <ShoppingCart className="w-4 h-4 text-green-400" />
              {show && <span>Cart</span>}
              {cartCount > 0 && <span className="w-4 h-4 rounded-full bg-green-500 text-black text-[9px] flex items-center justify-center font-black">{cartCount}</span>}
            </button>
          </div>
          {show && (
            <button onClick={() => base44.auth.logout("/")} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-red-400 hover:bg-red-900/20 text-xs font-semibold transition-all">
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          )}
        </div>
      </div>
    );
  };

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
          <span className="font-black text-white text-xs">Gamer<span className="text-purple-400">.Productions</span></span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <NotificationBell userEmail={user?.email} />
          <button onClick={() => setCartOpen(true)} className="relative">
            <ShoppingCart className="w-5 h-5 text-gray-400" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 text-black text-[8px] flex items-center justify-center font-black">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/70" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "tween", duration: 0.25 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-gray-950 border-r border-purple-900/30 flex flex-col">
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