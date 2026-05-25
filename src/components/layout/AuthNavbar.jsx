import React, { useState, useEffect } from "react";
import { Gamepad2, Heart, ShoppingCart, ClipboardList, Store, BarChart2, Shield, Package, CreditCard, Upload, User, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin, ACCOUNT_TYPES } from "@/lib/constants";
import { Link } from "react-router-dom";
import CartDropdown from "@/components/layout/CartDropdown";
import FavoritesDropdown from "@/components/layout/FavoritesDropdown";
import UserMegaMenu from "@/components/layout/UserMegaMenu";
import GlobalSearchBar from "@/components/layout/GlobalSearchBar";
import NotificationBell from "@/components/notifications/NotificationBell";

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
    { icon: ClipboardList, label: "Orders", href: "/dashboard?tab=orders" },
    { icon: CreditCard, label: "Payment", href: "/payment" },
  ];

  const sellerLinks = [
    { icon: Store, label: "My Listings", href: "/dashboard?tab=listings" },
    { icon: BarChart2, label: "Sales", href: "/dashboard?tab=sales" },
    { icon: Package, label: "Orders", href: "/dashboard?tab=orders" },
    { icon: CreditCard, label: "Payment", href: "/payment" },
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

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-sm mx-4">
          <GlobalSearchBar />
        </div>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
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
          {/* Messages */}
          <Link to="/messages" className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-700/50 transition-colors">
            <MessageCircle className="w-4 h-4 text-gray-400" />
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