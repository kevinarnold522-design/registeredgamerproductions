import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, ArrowLeft, ArrowRight, Check, Mail, Lock, User, Phone } from "lucide-react";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=pick type, 2=create account, 3=verify
  const [accountType, setAccountType] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otpMethod: "email",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectType = (type) => {
    setAccountType(type);
    setStep(2);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      // Use base44 invite + create profile approach
      await base44.users.inviteUser(form.email, "user");
      // Store pending profile in localStorage for post-login setup
      localStorage.setItem("pending_profile", JSON.stringify({
        username: form.username,
        account_type: accountType,
        phone_number: form.phone,
        preferred_otp_method: form.otpMethod,
        display_name: form.username,
      }));
      setStep(3);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const socialProviders = [
    { name: "Google", icon: "🔵", color: "bg-white text-gray-700 border border-gray-200" },
    { name: "Outlook", icon: "🔷", color: "bg-blue-600 text-white" },
    { name: "Yahoo", icon: "🟣", color: "bg-purple-600 text-white" },
    { name: "AOL", icon: "🔴", color: "bg-red-500 text-white" },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "radial-gradient(ellipse at center, #0f0f2e 0%, #000000 100%)" }}
    >
      {/* Stars bg */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-20"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">
              GAMER<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Productions</span>
            </span>
          </a>
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
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectType(type.id)}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl bg-gray-900/80 border border-gray-700 hover:border-purple-500 transition-colors text-left group"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{type.label}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{type.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                  </motion.button>
                ))}
              </div>
              <p className="text-center text-gray-500 text-sm mt-6">
                Already have an account?{" "}
                <a href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">Sign In</a>
              </p>
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

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {socialProviders.map((p) => (
                  <button key={p.name} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold ${p.color} hover:opacity-90 transition-opacity`}>
                    <span>{p.icon}</span> Continue with {p.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-xs">or create manually</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required
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
                  <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create password (min 8 chars)" required
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" required
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                </div>

                <div>
                  <p className="text-gray-400 text-xs mb-2">Preferred OTP verification method:</p>
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

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loading ? "Creating Account..." : "Create Account & Verify Email"}
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Email Sent */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl mx-auto mb-6">
                📧
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Check Your Email!</h2>
              <p className="text-gray-400 mb-2">We've sent a verification link to:</p>
              <p className="text-purple-400 font-bold text-lg mb-6">{form.email}</p>
              <p className="text-gray-500 text-sm mb-8">
                Click the link in the email to activate your account. Once verified, you can sign in and complete your profile setup.
              </p>
              <a href="/login"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity">
                <Check className="w-5 h-5" /> Go to Sign In
              </a>
              <p className="text-gray-600 text-xs mt-6">Didn't receive it? Check spam or <button className="text-purple-400 underline">resend</button></p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}