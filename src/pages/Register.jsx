import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Gamepad2, ArrowLeft, ArrowRight, Check, Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { ACCOUNT_TYPES, TERMS_AND_CONDITIONS } from "@/lib/constants";
import { base44 } from "@/api/base44Client";

export default function Register() {
  // Read ?type= param from URL to pre-select account type
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get("type");

  const [step, setStep] = useState(preselectedType ? 2 : 1);
  const [accountType, setAccountType] = useState(preselectedType || null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otpMethod: "email",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSelectType = (type) => {
    setAccountType(type);
    setStep(2);
  };

  const handleAccountFormNext = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!form.username.trim()) { setError("Username is required."); return; }
    setError("");
    setStep(3); // Go to Terms
  };

  const handleRegister = async () => {
    if (!termsAccepted) { setError("You must accept the Terms and Conditions."); return; }
    setLoading(true);
    try {
      await base44.users.inviteUser(form.email, "user");
      localStorage.setItem("pending_profile", JSON.stringify({
        username: form.username,
        account_type: accountType,
        phone_number: form.phone,
        preferred_otp_method: form.otpMethod,
        display_name: form.username,
      }));
      setStep(4);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  // Social OAuth providers — each opens the correct provider email login
  const socialProviders = [
    { name: "Google", icon: "🔵", color: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50", loginUrl: "https://accounts.google.com/signin" },
    { name: "Outlook", icon: "🔷", color: "bg-blue-600 text-white hover:bg-blue-700", loginUrl: "https://login.live.com" },
    { name: "Yahoo", icon: "🟣", color: "bg-purple-600 text-white hover:bg-purple-700", loginUrl: "https://login.yahoo.com" },
    { name: "AOL", icon: "🔴", color: "bg-red-500 text-white hover:bg-red-600", loginUrl: "https://login.aol.com" },
  ];

  const handleSocialLogin = (loginUrl) => {
    // Store pending account type then open provider's login in same tab
    localStorage.setItem("pending_profile", JSON.stringify({
      username: "",
      account_type: accountType || "regular",
      phone_number: "",
      preferred_otp_method: "email",
      display_name: "",
    }));
    window.open(loginUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "radial-gradient(ellipse at center, #0f0f2e 0%, #000000 100%)" }}
    >
      {/* Stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white opacity-20"
            style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />
        ))}
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">
              GAMER<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Productions</span>
            </span>
          </Link>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${step >= s ? "bg-purple-500" : "bg-gray-800"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Account Type */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-white">Join GAMER Productions</h2>
                <p className="text-gray-400 text-sm mt-1">What type of account are you creating?</p>
              </div>
              <div className="space-y-4">
                {ACCOUNT_TYPES.map((type) => (
                  <motion.button key={type.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectType(type.id)}
                    className="w-full flex items-start gap-4 p-5 rounded-2xl bg-gray-900/80 border border-gray-700 hover:border-purple-500 transition-colors text-left group">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{type.label}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{type.desc}</p>
                      {type.id === "digital_creator" && (
                        <div className="mt-2 space-y-1.5">
                          <p className="text-purple-300 text-xs font-bold">📹 What to upload:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {["🎮 Gameplay","🔧 Mods","📚 Tutorials","📡 Streams","🗺️ Walkthroughs","🏆 Missions","✂️ Highlights","⚽ Sports Games","🎯 FPS Clips"].map(f => (
                              <span key={f} className="text-xs bg-purple-900/40 border border-purple-700/40 text-purple-300 px-2 py-0.5 rounded-full">{f}</span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {["🔗 Link Shortener Earnings","🤖 AI Tools","🎮 Gaming Checkmark","💰 Earn $1/1K Views"].map(f => (
                              <span key={f} className="text-xs bg-pink-900/30 border border-pink-700/30 text-pink-300 px-2 py-0.5 rounded-full">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {type.id === "regular" && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {["📺 Link YouTube","🎬 Share Videos","🛒 Buy Products","❤️ Favorites"].map(f => (
                            <span key={f} className="text-xs bg-blue-900/30 border border-blue-700/30 text-blue-300 px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                      )}
                      {type.id === "business" && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {["🏪 List Products","🎬 Share Videos","✅ Verified Badge","📊 Sales Analytics","💳 PayPal Payouts"].map(f => (
                            <span key={f} className="text-xs bg-green-900/30 border border-green-700/30 text-green-300 px-2 py-0.5 rounded-full">{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
                  </motion.button>
                ))}
              </div>
              <div className="flex flex-col items-center gap-3 mt-6">
                <p className="text-gray-500 text-sm">
                  Already have an account?{" "}
                  <button onClick={() => base44.auth.redirectToLogin("/")} className="text-purple-400 hover:text-purple-300 font-semibold">Sign In</button>
                </p>
                <button onClick={() => base44.auth.redirectToLogin("/")}
                  className="w-full py-3 rounded-xl border border-purple-700/60 text-purple-300 font-bold text-sm hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2">
                  🔐 Sign In to Existing Account
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Create Account */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="text-center mb-6">
                <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${ACCOUNT_TYPES.find(t => t.id === accountType)?.color} items-center justify-center text-2xl mb-3`}>
                  {ACCOUNT_TYPES.find(t => t.id === accountType)?.icon}
                </div>
                <h2 className="text-2xl font-black text-white">Create Your Account</h2>
                <p className="text-purple-400 text-sm mt-1 font-semibold">{ACCOUNT_TYPES.find(t => t.id === accountType)?.label}</p>
              </div>

              {/* Social Providers */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {socialProviders.map((p) => (
                  <button key={p.name} onClick={() => handleSocialLogin(p.loginUrl)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity ${p.color}`}>
                    <span>{p.icon}</span> {p.name} Email
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-xs">or create manually</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              <form onSubmit={handleAccountFormNext} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" required
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number (optional)"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Create password (min 8 chars)" required
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="confirmPassword" type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" required
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* OTP Method */}
                <div>
                  <p className="text-gray-400 text-xs mb-2 font-semibold">Preferred OTP verification method:</p>
                  <div className="flex gap-3">
                    {["email", "sms"].map((method) => (
                      <label key={method} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer text-sm font-semibold transition-colors ${form.otpMethod === method ? "border-purple-500 bg-purple-900/30 text-purple-300" : "border-gray-700 text-gray-500"}`}>
                        <input type="radio" name="otpMethod" value={method} checked={form.otpMethod === method} onChange={handleChange} className="hidden" />
                        {method === "email" ? "📧 Email OTP" : "📱 SMS OTP"}
                      </label>
                    ))}
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base hover:opacity-90 transition-opacity">
                  Next — Review Terms
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Terms & Conditions */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="text-center mb-5">
                <ShieldCheck className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                <h2 className="text-2xl font-black text-white">Terms & Conditions</h2>
                <p className="text-gray-400 text-sm mt-1">Please read and accept before creating your account</p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 h-64 overflow-y-auto mb-5 text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                {TERMS_AND_CONDITIONS}
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded accent-purple-600 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  I have read and agree to the <span className="text-purple-400 font-semibold">Terms and Conditions</span>, 
                  including the Privacy Policy and Google AdSense policy compliance.
                </span>
              </label>

              {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

              <button onClick={handleRegister} disabled={!termsAccepted || loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-40">
                {loading ? "Creating Account..." : "✅ Accept & Create Account"}
              </button>
            </motion.div>
          )}

          {/* Step 4: Email Verification Sent */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl mx-auto mb-6">
                📧
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Check Your Email!</h2>
              <p className="text-gray-400 mb-2">We've sent a verification link to:</p>
              <p className="text-purple-400 font-bold text-lg mb-4">{form.email}</p>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 text-left">
                <p className="text-white font-semibold text-sm mb-2">📋 What happens next:</p>
                <ol className="text-gray-400 text-xs space-y-1.5 list-decimal list-inside">
                  <li>Click the verification link sent to your email</li>
                  <li>Your account will be activated automatically</li>
                  <li>Sign in and complete your profile setup</li>
                  {accountType !== "regular" && <li>Submit verification documents to become a seller</li>}
                  <li>Start exploring GAMER Productions!</li>
                </ol>
              </div>
              <p className="text-gray-500 text-xs mb-1">An OTP will be required on each login for security via <span className="text-purple-400">{form.otpMethod === "email" ? "Email" : "SMS"}</span>.</p>
              <button
                onClick={() => base44.auth.redirectToLogin("/")}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity mt-4">
                <Check className="w-5 h-5" /> Go to Sign In
              </button>
              <p className="text-gray-600 text-xs mt-4">
                Didn't receive it? Check spam or <button onClick={async () => { try { await base44.users.inviteUser(form.email, "user"); } catch {} }} className="text-purple-400 underline">resend</button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}