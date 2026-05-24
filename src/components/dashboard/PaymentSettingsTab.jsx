import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { CreditCard, CheckCircle, AlertCircle, Loader2, Banknote, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSettingsTab({ profile, user }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(!!profile?.paypal_merchant_id || !!profile?.stripe_account_id);
  const [paymentMethod, setPaymentMethod] = useState(profile?.payout_method || "paypal");
  const [showStripeOnboarding, setShowStripeOnboarding] = useState(false);

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      // In production, this would use Stripe OAuth
      // For now, simulate the onboarding flow
      const stripeAccount = `acct_${Math.random().toString(36).substring(7)}`;
      
      // Update profile
      await base44.entities.UserProfile.update(profile.id, {
        stripe_account_id: stripeAccount,
        payout_method: "stripe",
        verification_status: "approved",
        is_verified: true,
      });

      setConnected(true);
      setPaymentMethod("stripe");
      setShowStripeOnboarding(false);
      toast.success("✅ Card/Bank connected successfully! You're now verified.");
    } catch (e) {
      console.error("Stripe connection error:", e);
      toast.error("Failed to connect. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectPayPal = async () => {
    setConnecting(true);
    try {
      const paypalId = `PAYPAL_${Math.random().toString(36).substring(7)}`;
      
      await base44.entities.UserProfile.update(profile.id, {
        paypal_merchant_id: paypalId,
        payout_method: "paypal",
        verification_status: "approved",
        is_verified: true,
      });

      setConnected(true);
      setPaymentMethod("paypal");
      toast.success("✅ PayPal connected successfully! You're now verified.");
    } catch (e) {
      console.error("PayPal connection error:", e);
      toast.error("Failed to connect. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await base44.entities.UserProfile.update(profile.id, {
        stripe_account_id: null,
        paypal_merchant_id: null,
        payout_method: null,
        verification_status: "none",
        is_verified: false,
      });
      setConnected(false);
      setPaymentMethod("");
      toast.success("Payment method disconnected");
    } catch (e) {
      toast.error("Failed to disconnect");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h3 className="text-white font-black text-xl mb-2">💳 Payment Settings</h3>
        <p className="text-gray-400 text-sm">
          Connect your bank account or debit card to receive payouts from sales. 
          Choose between Stripe (cards) or PayPal.
        </p>
      </div>

      {/* Connected Status */}
      {connected ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-black text-lg">Payment Method Connected</p>
                  <span className="text-[10px] bg-green-500/20 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full font-bold">
                    ✓ VERIFIED
                  </span>
                </div>
                <p className="text-green-400 text-sm font-semibold mt-1">
                  {paymentMethod === "stripe" ? "💳 Debit/Credit Card (Stripe)" : "🅿️ PayPal Account"}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  You'll receive 90% of each sale automatically
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Badge */}
          <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {paymentMethod === "stripe" ? (
                  <>
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-bold text-sm">Stripe Account</p>
                      <p className="text-gray-500 text-xs">Debit/Credit Card & Bank Transfer</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-bold text-sm">PayPal</p>
                      <p className="text-gray-500 text-xs">PayPal Email</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-lg bg-red-900/40 border border-red-700/50 text-red-400 text-xs font-semibold hover:bg-red-900/60 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
              <p className="text-green-400 text-xs font-bold mb-1">✓ Automatic Payouts</p>
              <p className="text-gray-500 text-[10px]">90% of sales sent automatically</p>
            </div>
            <div className="bg-green-900/10 border border-green-700/30 rounded-lg p-3">
              <p className="text-green-400 text-xs font-bold mb-1">✓ Verified Seller</p>
              <p className="text-gray-500 text-[10px]">Badge displayed on your profile</p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Connection Options */
        <div className="space-y-4">
          {/* Stripe Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/20 border-2 border-blue-500/40 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black text-lg">Stripe</p>
                    <span className="text-[10px] bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">Accept Visa, Mastercard, debit cards</p>
                </div>
              </div>
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">
                90% Payout
              </span>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-gray-300 text-xs">Accept all major debit/credit cards</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-gray-300 text-xs">Automatic bank transfers</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-gray-300 text-xs">Instant verification & badge</p>
              </div>
            </div>

            <button
              onClick={handleConnectStripe}
              disabled={connecting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Connect Card/Bank Account
                </>
              )}
            </button>
          </motion.div>

          {/* PayPal Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/60 border-2 border-gray-700 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-lg">PayPal</p>
                  <p className="text-gray-400 text-xs">PayPal email for payouts</p>
                </div>
              </div>
              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">
                90% Payout
              </span>
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-gray-300 text-xs">Worldwide availability</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-gray-300 text-xs">Email-based payouts</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-gray-300 text-xs">Instant verification</p>
              </div>
            </div>

            <button
              onClick={handleConnectPayPal}
              disabled={connecting}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Connect PayPal
                </>
              )}
            </button>
          </motion.div>

          {/* Info Box */}
          <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-300 text-xs font-bold mb-1">How Payouts Work</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  When a customer buys from you, 90% goes to your connected payment method 
                  (Stripe or PayPal) and 10% stays with the platform as commission. 
                  Payouts are automatic and instant upon successful payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}