import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Gamepad2, Search, Menu, X, Zap, ArrowRight, User, Store, Radio, Youtube } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmailLoginModal from "@/components/auth/EmailLoginModal.jsx";
import EarnNowButton from "@/components/shared/EarnNowButton";

const navLinks = [
  { label: "Categories", href: "#categories" },
  { label: "Go Live", href: "/studio", live: true },
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [controllerCycling, setControllerCycling] = useState(false);
  const navigate = useNavigate();

  const colorCycles = [
    "from-purple-600 to-pink-600",   // default
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500",
    "from-indigo-500 to-violet-500",
  ];
  const [colorIdx, setColorIdx] = useState(0);

  const handleControllerClick = () => {
    setControllerCycling(true);
    setColorIdx(i => (i + 1) % colorCycles.length);
    setTimeout(() => setControllerCycling(false), 600);
  };
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignUp = (typeId) => {
    setShowSignUpModal(false);
    navigate(`/register?type=${typeId}`);
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
        <div className="absolute bottom-0 left-4 right-4 h-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.85)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                onClick={handleControllerClick}
                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 relative flex-shrink-0 bg-gradient-to-br ${colorCycles[colorIdx]}`}
                animate={{ rotate: [0, -2, 2, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                style={{
                  boxShadow: controllerCycling
                    ? "0 0 16px rgba(168,85,247,0.5)"
                    : "0 0 6px rgba(168,85,247,0.25)",
                  transition: "box-shadow 0.4s ease",
                }}
              >
                <Gamepad2 className={`w-5 h-5 text-white ${controllerCycling ? "controller-color-cycle" : ""}`} />
              </motion.div>
              <div className="hidden sm:block">
                <span className="font-black text-white text-sm">Gamer</span>
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm">.Productions</span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                link.href.startsWith("#") ? (
                  <a key={link.label} href={link.href}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${link.live ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-purple-400"}`}>
                    {link.label}
                  </a>
                ) : (
                  <button key={link.label} onClick={() => navigate(link.href)}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${link.live ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-purple-400"}`}>
                    {link.live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    {link.label}
                  </button>
                )
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
                onKeyDown={e => e.key === "Enter" && searchQuery && navigate(`/?search=${encodeURIComponent(searchQuery)}`)}
              />
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <EarnNowButton />
              <button
                onClick={() => setShowSignUpModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-black transition-all shadow-lg radiant-glow"
                style={{
                  background: "linear-gradient(135deg, #ff6a00, #ee0979, #ff6a00)",
                  backgroundSize: "200% 200%",
                  animation: "fire-shift 2s ease infinite",
                  boxShadow: "0 0 20px rgba(238,9,121,0.5), 0 0 40px rgba(255,106,0,0.3)",
                }}
              >
                🔥 Get Started
              </button>
              <style>{`@keyframes fire-shift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}</style>
              <button
                onClick={() => setShowLoginModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 text-white text-sm font-black hover:from-gray-700 hover:to-gray-600 transition-all shadow-lg radiant-glow"
              >
                Log In
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
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="text-gray-300 hover:text-purple-400 font-medium py-1" onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ) : (
              <button key={link.label} onClick={() => { setMenuOpen(false); navigate(link.href); }} className="text-gray-300 hover:text-purple-400 font-medium py-1 text-left">
                {link.label}
              </button>
            )
          ))}
            <button
              onClick={() => { setMenuOpen(false); setShowLoginModal(true); }}
              className="mt-2 text-center px-4 py-2 rounded-lg border border-gray-700 text-gray-300 font-semibold"
            >
              Log In
            </button>
            <button
              onClick={() => { setMenuOpen(false); setShowSignUpModal(true); }}
              className="text-center px-4 py-2 rounded-lg text-white font-semibold"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ee0979)" }}
            >
              🔥 Get Started
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
                  <Gamepad2 className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="font-black text-white text-sm">Gamer</span>
                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-sm">.Productions</span>
                  </div>
                </div>
                <button onClick={() => setShowSignUpModal(false)} className="text-gray-600 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* GP Logo welcome signage */}
              <div className="flex flex-col items-center my-4">
                <motion.img
                  src="https://media.base44.com/images/public/6a126acdde36b8358b1010f3/2c492ba5e_86DEEF8D-A166-44B9-8CC9-D721135C9BB9.png"
                  alt="Gamer Productions"
                  className="w-20 h-20 object-contain mb-2"
                  animate={{ scale: [1, 1.06, 1], rotate: [0, -4, 4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 0 18px rgba(168,85,247,0.7))" }}
                />
                <span className="text-2xl font-black text-white tracking-tight">Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Gamer.Productions</span></span>
                <span className="text-gray-500 text-xs mt-1">The #1 Gaming Hub Community</span>
              </div>

              <h2 className="text-base font-black text-white mb-1">Who are you joining as?</h2>
              <p className="text-gray-500 text-sm mb-4">Choose your account type to get started:</p>

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
                    onClick={() => { setShowSignUpModal(false); setShowLoginModal(true); }}
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

      <EmailLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignUp={() => setShowSignUpModal(true)}
      />
    </>
  );
}