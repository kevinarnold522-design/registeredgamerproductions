import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Search, Menu, X, Zap, ArrowRight, User, Store, Youtube, Radio, Mail, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

const navLinks = [
  { label: "Categories", href: "#categories" },
  { label: "Live", href: "/category?cat=livestream", live: true },
  { label: "Mods", href: "/category?cat=modding" },
  { label: "Tournaments", href: "/category?cat=tournaments" },
  { label: "Marketplace", href: "/category?cat=buy_sell" },
];

const accountTypes = [
  {
    id: "regular",
    icon: <User className="w-5 h-5 text-blue-400" />,
    label: "Regular Gamer",
    desc: "Browse, buy & share videos",
    color: "border-blue-500/40 hover:border-blue-400/70 bg-blue-900/10",
  },
  {
    id: "digital_creator",
    icon: <Youtube className="w-5 h-5 text-red-400" />,
    label: "Digital Creator",
    desc: "Upload gameplay, mods, tutorials, streams, walkthroughs & missions. Earn $1/1K views + link shortener bonuses.",
    color: "border-purple-500/40 hover:border-purple-400/70 bg-purple-900/10",
    tags: ["🎮 Gameplay","🔧 Mods","📡 Streams","🗺️ Walkthroughs","🏆 Missions","✂️ Highlights"],
  },
  {
    id: "business",
    icon: <Store className="w-5 h-5 text-green-400" />,
    label: "Business / Seller",
    desc: "List & sell gaming products or services",
    color: "border-green-500/40 hover:border-green-400/70 bg-green-900/10",
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const EMAIL_PROVIDERS = [
    { name: "Google / Gmail", icon: "🔵", hint: "gmail.com", url: null },
    { name: "Yahoo Mail", icon: "🟣", hint: "yahoo.com", url: "https://mail.yahoo.com" },
    { name: "Outlook / Hotmail", icon: "🔷", hint: "outlook.com / hotmail.com", url: "https://outlook.live.com" },
    { name: "iCloud Mail", icon: "☁️", hint: "icloud.com / me.com", url: "https://www.icloud.com/mail" },
    { name: "ProtonMail", icon: "🛡️", hint: "proton.me", url: "https://mail.proton.me" },
    { name: "Zoho Mail", icon: "🟠", hint: "zoho.com", url: "https://mail.zoho.com" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignUp = (typeId) => {
    setShowSignUpModal(false);
    window.location.href = `/register?type=${typeId}`;
  };

  const handleSignInClick = async () => {
    // Check if user already has an account before allowing sign in
    base44.auth.redirectToLogin("/dashboard");
  };

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-gray-950/95 backdrop-blur-md border-b border-purple-900/40 shadow-lg shadow-purple-900/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-white text-sm">GAMER</span>
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm">
                  Productions
                </span>
              </div>
            </a>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${link.live ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-purple-400"}`}>
                  {link.live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  {link.label}
                </a>
              ))}
            </div>

            {/* Search Bar */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 ${searchFocused ? "bg-gray-800 border border-purple-600/60 w-56" : "bg-gray-900/60 border border-gray-800 w-40"}`}>
              <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search..."
                className="bg-transparent text-white text-xs placeholder-gray-600 outline-none flex-1 min-w-0"
                onKeyDown={e => e.key === "Enter" && searchQuery && (window.location.href = `/?search=${encodeURIComponent(searchQuery)}`)}
              />
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSignUpModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-black hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/40"
              >
                <Zap className="w-4 h-4" />
                Sign Up Free
              </button>
              <button
                onClick={() => setShowSignInModal(true)}
                className="hidden sm:block text-gray-400 hover:text-white text-sm font-semibold transition-colors px-3 py-2"
              >
                Sign In
              </button>
              <button
                className="md:hidden p-2 text-gray-400"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-gray-950 border-t border-purple-900/30 px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-300 hover:text-purple-400 font-medium py-1"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => { setMenuOpen(false); setShowSignInModal(true); }}
              className="mt-2 text-center px-4 py-2 rounded-lg border border-gray-700 text-gray-300 font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={() => { setMenuOpen(false); setShowSignUpModal(true); }}
              className="text-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
            >
              Join Now
            </button>
          </div>
        )}
      </motion.nav>

      {/* Sign Up Account Type Modal */}
      <AnimatePresence>
        {showSignUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowSignUpModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-md shadow-2xl shadow-purple-900/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-black text-sm">GAMER Productions</span>
                </div>
                <button onClick={() => setShowSignUpModal(false)} className="text-gray-600 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-xl font-black text-white mt-4 mb-1">Who are you joining as?</h2>
              <p className="text-gray-500 text-sm mb-6">Choose your account type to get started:</p>

              <div className="space-y-3 mb-5">
                {accountTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleSignUp(type.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${type.color}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center flex-shrink-0">
                      {type.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{type.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{type.desc}</p>
                      {type.tags && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {type.tags.map(t => <span key={t} className="text-[10px] bg-purple-900/40 border border-purple-700/30 text-purple-300 px-1.5 py-0.5 rounded-full">{t}</span>)}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 text-center">
                <p className="text-gray-500 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => { setShowSignUpModal(false); setShowSignInModal(true); }}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Sign In →
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign In Modal */}
      <AnimatePresence>
        {showSignInModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={() => setShowSignInModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-md shadow-2xl shadow-purple-900/30"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-black text-sm">Sign In to GAMER Productions</span>
                </div>
                <button onClick={() => setShowSignInModal(false)} className="text-gray-600 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* No account warning */}
              <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-xl px-4 py-3 mb-4 text-xs text-yellow-300 leading-relaxed">
                ⚠️ <strong>Don't have an account yet?</strong> You must <button onClick={() => { setShowSignInModal(false); setShowSignUpModal(true); }} className="underline text-yellow-200 hover:text-white font-bold">create a free account first</button> before you can sign in.
              </div>

              {/* Primary sign-in button */}
              <button
                onClick={() => { setShowSignInModal(false); base44.auth.redirectToLogin("/dashboard"); }}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-sm hover:opacity-90 transition-opacity mb-4"
                style={{ boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}
              >
                <Zap className="w-4 h-4" />
                I Have an Account — Sign In
              </button>

              <p className="text-gray-500 text-xs text-center mb-3">— or open your email provider first —</p>

              {/* Email providers */}
              <div className="space-y-2 mb-5">
                {EMAIL_PROVIDERS.map((ep) => (
                  <div key={ep.name} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800">
                    <span className="text-lg">{ep.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold">{ep.name}</p>
                      <p className="text-gray-500 text-[10px]">{ep.hint}</p>
                    </div>
                    {ep.url ? (
                      <a
                        href={ep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-700 hover:text-white transition-colors font-semibold whitespace-nowrap"
                      >
                        Open ↗
                      </a>
                    ) : (
                      <button
                        onClick={() => { setShowSignInModal(false); base44.auth.redirectToLogin("/dashboard"); }}
                        className="flex items-center gap-1 text-[10px] bg-purple-900/40 border border-purple-700/40 text-purple-300 px-2.5 py-1.5 rounded-lg hover:bg-purple-900/60 transition-colors font-semibold whitespace-nowrap"
                      >
                        Sign In →
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 text-center">
                <p className="text-gray-500 text-sm">
                  New here?{" "}
                  <button
                    onClick={() => { setShowSignInModal(false); setShowSignUpModal(true); }}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    Create Free Account →
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}