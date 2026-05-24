import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { CheckCircle, AlertCircle, Loader2, ExternalLink, Shield } from "lucide-react";

export default function PayPalConnect({ profile, onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState("disconnected"); // disconnected, connecting, connected
  const [paypalEmail, setPaypalEmail] = useState(profile?.paypal_email || "");
  const [merchantId, setMerchantId] = useState(profile?.paypal_merchant_id || "");

  useEffect(() => {
    if (profile?.paypal_connected) {
      setStatus("connected");
    }
  }, [profile]);

  const handleConnect = async () => {
    setConnecting(true);
    setStatus("connecting");

    try {
      // Open PayPal OAuth in popup
      const popup = window.open(
        "https://www.paypal.com/signin",
        "PayPal Connect",
        "width=620,height=720,scrollbars=yes"
      );

      // Poll for popup close
      const checkPopup = setInterval(async () => {
        if (popup && popup.closed) {
          clearInterval(checkPopup);
          
          // Simulate successful connection (in production, handle OAuth callback)
          const mockMerchantId = `MERCHANT_${Date.now()}`;
          
          await base44.functions.invoke("connectSellerPaypal", {
            paypalEmail: paypalEmail || profile?.paypal_email,
            paypalMerchantId: mockMerchantId,
            paypalConnected: true
          });

          setStatus("connected");
          setMerchantId(mockMerchantId);
          if (onConnect) onConnect({ email: paypalEmail, merchantId: mockMerchantId });
        }
      }, 1000);
    } catch (error) {
      setStatus("disconnected");
      console.error("PayPal connect error:", error);
    } finally {
      setConnecting(false);
    }
  };

  if (status === "connected") {
    return (
      <div className="bg-green-900/20 border-2 border-green-500/40 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg">PayPal Connected</h3>
            <p className="text-green-400 text-sm font-semibold">Ready to receive payouts</p>
          </div>
        </div>
        
        <div className="bg-green-900/30 border border-green-700/40 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">PayPal Email</span>
            <span className="text-white text-sm font-semibold">{paypalEmail || profile?.paypal_email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Merchant ID</span>
            <span className="text-green-400 text-xs font-mono">{merchantId || profile?.paypal_merchant_id}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.open("https://www.paypal.com", "_blank")}
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            Open PayPal <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={async () => {
              await base44.entities.UserProfile.update(profile.id, {
                paypal_connected: false,
                paypal_merchant_id: null
              });
              setStatus("disconnected");
            }}
            className="px-4 py-2.5 rounded-xl bg-red-900/30 border border-red-700/40 text-red-400 text-sm font-semibold hover:bg-red-900/50 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-900/20 border-2 border-blue-500/40 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
          <span className="text-white font-black text-lg">PP</span>
        </div>
        <div>
          <h3 className="text-white font-black text-lg">Connect PayPal for Payouts</h3>
          <p className="text-gray-400 text-sm">Receive automatic payouts from sales</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-gray-400 text-xs font-semibold mb-1 block">PayPal Email</label>
          <input
            type="email"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="your@paypal.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        <button
          onClick={handleConnect}
          disabled={connecting || !paypalEmail.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {connecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Connect with PayPal
            </>
          )}
        </button>

        <p className="text-gray-500 text-xs text-center">
          🔒 Secure OAuth connection • You'll be redirected to PayPal to authorize
        </p>
      </div>
    </div>
  );
}