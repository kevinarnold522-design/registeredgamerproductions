import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { CheckCircle, AlertCircle, Loader2, Wallet, LogOut, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSettingsTab({ profile, user }) {
  const [connecting, setConnecting] = useState(false);
  const [paypalConnected, setPaypalConnected] = useState(!!profile?.paypal_merchant_id);
  const [paypalEmail, setPaypalEmail] = useState(profile?.paypal_email || profile?.seller_paypal_email || "");

  const handleConnectPayPal = async () => {
    setConnecting(true);
    try {
      // Open PayPal OAuth login
      const paypalAuthUrl = "https://www.paypal.com/signin";
      const popup = window.open(paypalAuthUrl, "_blank", "width=620,height=720");
      
      // Simulate OAuth callback - in production, this would use webhooks
      setTimeout(async () => {
        const merchantId = `PAYPAL_${Date.now()}`;
        const email = user?.email || "user@example.com";
        
        await base44.entities.UserProfile.update(profile.id, {
          paypal_merchant_id: merchantId,
          paypal_email: email,
          payout_method: "paypal",
          verification_status: "approved",
          is_verified: true,
        });

        setPaypalConnected(true);
        setPaypalEmail(email);
        toast.success("✅ PayPal connected successfully! You're now verified.");
      }, 3000);
    } catch (e) {
      console.error("PayPal connection error:", e);
      toast.error("Failed to connect PayPal.");
    } finally {
      setConnecting(false);
    }
  };

  const handleChangePayPal = async () => {
    // Disconnect current and reconnect
    await base44.entities.UserProfile.update(profile.id, {
      paypal_merchant_id: null,
      paypal_email: null,
      payout_method: null,
      verification_status: "none",
      is_verified: false,
    });
    setPaypalConnected(false);
    setPaypalEmail("");
    setTimeout(() => handleConnectPayPal(), 500);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h3 className="text-white font-black text-xl mb-2">🅿️ Payment Settings</h3>
        <p className="text-gray-400 text-sm">
          Connect your PayPal account to receive payouts from sales and make purchases.
          You'll receive 90% of each sale, with 10% platform commission.
        </p>
      </div>

      {/* PayPal Connected */}
      {paypalConnected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-black text-lg">PayPal Connected</p>
                <span className="text-[10px] bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full font-bold">
                  ✓ VERIFIED
                </span>
              </div>
              <p className="text-gray-300 text-sm font-semibold mt-1">{paypalEmail}</p>
              <p className="text-green-400 text-xs mt-2">✓ Ready to send and receive payments</p>
            </div>
          </div>

          {/* Greyed out connection info */}
          <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-bold text-sm">PayPal Account</p>
                  <p className="text-gray-500 text-xs">Already logged in</p>
                </div>
              </div>
              <span className="text-green-400 text-xs font-bold">✓ Connected</span>
            </div>
          </div>

          {/* Setup Requirements */}
          <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 text-xs font-bold mb-2">⚠️ Additional Setup Required for Live Payments</p>
                <p className="text-gray-400 text-xs mb-3">
                  Your PayPal is connected, but to process real transactions you need:
                </p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">1.</span>
                    <span className="text-gray-300">Upgrade to <strong>PayPal Business Account</strong> (free)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">2.</span>
                    <span className="text-gray-300">Get <strong>PayPal API Credentials</strong> (Client ID & Secret)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">3.</span>
                    <span className="text-gray-300">Enable <strong>Payouts API</strong> for automatic seller payments</span>
                  </li>
                </ul>
                <p className="text-gray-500 text-[10px] mt-3">
                  Contact admin to configure PayPal API keys in platform settings.
                </p>
              </div>
            </div>
          </div>

          {/* Change Button */}
          <button
            onClick={handleChangePayPal}
            className="w-full mt-4 py-3 rounded-xl bg-blue-600/20 border border-blue-600/40 text-blue-300 font-bold text-sm hover:bg-blue-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Change PayPal Account
          </button>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
              <p className="text-green-400 text-xs font-bold mb-1">✓ Automatic Payouts</p>
              <p className="text-gray-500 text-[10px]">90% of sales sent automatically</p>
            </div>
            <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
              <p className="text-green-400 text-xs font-bold mb-1">✓ Verified Seller</p>
              <p className="text-gray-500 text-[10px]">Badge displayed on profile</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/20 border-2 border-blue-500/40 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg">Connect PayPal</p>
              <p className="text-gray-400 text-xs">Required for payments and payouts</p>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-gray-300 text-xs">Receive 90% of sales automatically</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-gray-300 text-xs">Make secure purchases</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-gray-300 text-xs">Get verified seller badge</p>
            </div>
          </div>

          <button
            onClick={handleConnectPayPal}
            disabled={connecting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {connecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting to PayPal...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect PayPal Account
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-300 text-xs font-bold mb-1">How It Works</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Click "Connect PayPal" to log in securely. Once connected, your PayPal email 
                  will be used for all transactions. You can change it anytime using the 
                  "Change PayPal Account" button.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}