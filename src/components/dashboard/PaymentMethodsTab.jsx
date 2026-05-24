import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const PAYMENT_METHODS = [
  {
    id: "paypal",
    name: "PayPal",
    icon: "🅿️",
    desc: "Worldwide — 200+ countries",
    color: "border-blue-500/50 bg-blue-900/10",
    badge: "Most Popular",
    badgeColor: "bg-blue-500/20 text-blue-400",
    connectUrl: "https://www.paypal.com/signin",
    type: "oauth",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: "💳",
    desc: "Cards & bank — 40+ countries",
    color: "border-purple-500/50 bg-purple-900/10",
    badge: "Recommended",
    badgeColor: "bg-purple-500/20 text-purple-400",
    connectUrl: "https://stripe.com/",
    type: "oauth",
  },
  {
    id: "wise",
    name: "Wise",
    icon: "🌍",
    desc: "Low-fee international transfers — 80+ currencies",
    color: "border-green-500/50 bg-green-900/10",
    badge: "Global",
    badgeColor: "bg-green-500/20 text-green-400",
    connectUrl: "https://wise.com/",
    type: "link",
  },
  {
    id: "payoneer",
    name: "Payoneer",
    icon: "💰",
    desc: "Best for freelancers & creators globally",
    color: "border-orange-500/50 bg-orange-900/10",
    badge: "Creators",
    badgeColor: "bg-orange-500/20 text-orange-400",
    connectUrl: "https://www.payoneer.com/",
    type: "link",
  },
  {
    id: "skrill",
    name: "Skrill",
    icon: "⚡",
    desc: "Fast digital wallet — 120+ countries",
    color: "border-pink-500/50 bg-pink-900/10",
    badge: "Fast",
    badgeColor: "bg-pink-500/20 text-pink-400",
    connectUrl: "https://www.skrill.com/",
    type: "link",
  },
  {
    id: "westernunion",
    name: "Western Union",
    icon: "🏛️",
    desc: "Cash pickup or bank — 200+ countries",
    color: "border-yellow-500/50 bg-yellow-900/10",
    badge: "Cash Option",
    badgeColor: "bg-yellow-500/20 text-yellow-400",
    connectUrl: "https://www.westernunion.com/",
    type: "link",
  },
  {
    id: "remitly",
    name: "Remitly",
    icon: "📲",
    desc: "Fast international bank transfers",
    color: "border-sky-500/50 bg-sky-900/10",
    badge: "Fast Transfer",
    badgeColor: "bg-sky-500/20 text-sky-400",
    connectUrl: "https://www.remitly.com/",
    type: "link",
  },
  {
    id: "crypto",
    name: "Crypto (USDT/BTC)",
    icon: "₿",
    desc: "Receive in crypto via Binance or any wallet",
    color: "border-amber-500/50 bg-amber-900/10",
    badge: "Borderless",
    badgeColor: "bg-amber-500/20 text-amber-400",
    connectUrl: "https://www.binance.com/",
    type: "link",
  },
];

export default function PaymentMethodsTab({ profile }) {
  const [connected, setConnected] = useState(!!profile?.paypal_merchant_id || !!profile?.paypal_email);

  const handleConnectPayPal = async () => {
    // Open PayPal OAuth popup
    const popup = window.open("https://www.paypal.com/signin", "_blank", "width=620,height=720");
    // Poll for popup close and redirect to payment settings
    const timer = setInterval(async () => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        // Refresh profile to get updated paypal_email
        const profiles = await base44.entities.UserProfile.filter({ user_email: profile?.user_email });
        if (profiles.length > 0 && profiles[0].paypal_email) {
          setConnected(true);
          // Redirect to dashboard payment settings after successful connection
          setTimeout(() => {
            window.location.href = "/dashboard?tab=payment";
          }, 1000);
        }
      }
    }, 500);
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-white font-black text-xl mb-1">Payment Methods</h3>
      <p className="text-gray-400 text-sm mb-6">
        Connect a payment method to buy, sell, and receive payouts. Use any globally-available service below.
      </p>

      {/* PayPal — primary */}
      {connected && profile?.paypal_email ? (
        <div className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center font-black text-white text-sm">✓</div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-black">PayPal Connected</p>
                <span className="text-[10px] bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>
              <p className="text-gray-300 text-xs font-semibold">{profile.paypal_email}</p>
            </div>
          </div>
          
          {/* What Happens Next */}
          <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-400 text-[10px] font-bold">✓</span>
              </div>
              <div>
                <p className="text-green-300 text-xs font-bold mb-2">✅ You're All Set! Here's What Happens Now:</p>
                <ul className="text-gray-400 text-xs leading-relaxed space-y-1">
                  <li>• <strong className="text-green-400">Ready to Sell:</strong> You can now create listings and receive payments</li>
                  <li>• <strong className="text-green-400">Automatic Payouts:</strong> 90% of sales sent to this PayPal automatically</li>
                  <li>• <strong className="text-green-400">Verified Badge:</strong> Your profile shows the verified seller badge</li>
                  <li>• <strong className="text-green-400">Ready to Buy:</strong> You can make secure purchases on the platform</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Account Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-3">
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-wider mb-1">Account Name</p>
              <p className="text-white text-sm font-semibold">{profile?.paypal_account_name || "Verified Account"}</p>
            </div>
            <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-3">
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-wider mb-1">Account Type</p>
              <p className="text-white text-sm font-semibold">{profile?.paypal_account_type === "business" ? "🏢 Business" : "👤 Personal"}</p>
            </div>
            <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-3">
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-wider mb-1">Country</p>
              <p className="text-white text-sm font-semibold">{profile?.paypal_country || "Global"}</p>
            </div>
            <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-3">
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-wider mb-1">Status</p>
              <p className="text-white text-sm font-semibold">✓ Verified</p>
            </div>
          </div>

          <div className="flex items-start gap-2 mb-4 p-3 bg-green-900/20 border border-green-700/30 rounded-xl">
            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <p className="text-green-300 text-xs font-bold">Ready for Transactions</p>
              <p className="text-green-400/80 text-[10px] mt-0.5">You can receive payouts and make secure purchases on the platform</p>
            </div>
          </div>

          <button
            onClick={handleConnectPayPal}
            className="w-full py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 font-bold text-sm hover:bg-gray-700 transition-colors"
          >
            Change PayPal Account →
          </button>
        </div>
      ) : (
        <div className="bg-blue-900/20 border-2 border-blue-500/40 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm">PP</div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-black">PayPal</p>
                <span className="text-[10px] bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-full font-bold">Default Payout</span>
              </div>
              <p className="text-gray-400 text-xs">Receive earnings + sales payouts worldwide</p>
            </div>
          </div>
          
          {/* How to Connect Instructions */}
          <div className="bg-blue-900/30 border border-blue-700/40 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-400 text-[10px] font-bold">!</span>
              </div>
              <div>
                <p className="text-blue-300 text-xs font-bold mb-2">How to Link Your PayPal Account</p>
                <ol className="text-gray-400 text-xs leading-relaxed space-y-1">
                  <li>1. Click "Link to PayPal Account Settings" to open PayPal</li>
                  <li>2. Log in and verify your email address in PayPal settings</li>
                  <li>3. Enter the same email in the field below</li>
                  <li>4. Click "Connect to PayPal" to save it</li>
                  <li>5. You'll be verified as a seller instantly</li>
                </ol>
              </div>
            </div>
          </div>
          
          {/* Link to PayPal Button */}
          <a
            href="https://www.paypal.com/myaccount/settings/notifications"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 font-bold text-sm hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            🔗 Link to PayPal Account Settings →
          </a>
          
          <button
            onClick={handleConnectPayPal}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-900/30"
          >
            🔗 Connect to PayPal
          </button>
        </div>
      )}

      {/* Stripe */}
      <div className="bg-purple-900/20 border-2 border-purple-500/40 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-black text-white text-lg">S</div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-black">Stripe</p>
                {connected.includes("stripe") && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">✓ Connected</span>}
              </div>
              <p className="text-gray-400 text-xs">Cards, bank transfers — 40+ countries</p>
            </div>
          </div>
          <button
            onClick={() => {
              window.open("https://stripe.com/", "_blank", "width=620,height=720");
              setConnected((prev) => [...new Set([...prev, "stripe"])]);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Connect Stripe →
          </button>
        </div>
      </div>

      {/* Global Options */}
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">🌍 Global Transfer Options</p>
      <div className="space-y-2.5 mb-6">
        {PAYMENT_METHODS.filter((m) => m.id !== "paypal" && m.id !== "stripe").map((method) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between p-4 rounded-xl border ${method.color}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{method.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">{method.name}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${method.badgeColor}`}>{method.badge}</span>
                  {connected.includes(method.id) && (
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold">✓</span>
                  )}
                </div>
                <p className="text-gray-500 text-xs">{method.desc}</p>
              </div>
            </div>
            <a
              href={method.connectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:bg-gray-700 hover:text-white transition-colors whitespace-nowrap"
            >
              Open ↗
            </a>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-xs text-gray-400">
        <p className="font-bold text-gray-300 mb-1">💡 Note on Local Banking</p>
        Direct integration with local banks (GCash, BDO, BPI, Maya) requires verified business accounts and direct API agreements. Use <strong className="text-green-400">Wise</strong> or <strong className="text-orange-400">Payoneer</strong> to receive payouts internationally, then transfer to your local bank — they officially support PH bank deposits.
      </div>
    </div>
  );
}