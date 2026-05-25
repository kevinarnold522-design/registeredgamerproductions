import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function PayPalCheckout({ cartItems, totalAmount, userEmail, onSuccess, onError }) {
  const paypalContainerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(null);
  const [loading, setLoading] = useState(true);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (totalAmount <= 0 || !cartItems?.length) {
      setLoading(false);
      return;
    }

    // Load PayPal SDK dynamically with live client ID
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "live";
    
    // Fetch client ID from backend via a status check approach
    const loadSDK = async () => {
      try {
        // Get client ID — we pass it from backend
        const res = await base44.functions.invoke("verifyPaymentStatus", { orderId: "test_check" }).catch(() => null);
        
        const existingScript = document.getElementById("paypal-sdk");
        if (existingScript) {
          setSdkReady(true);
          setLoading(false);
          return;
        }

        // We need to get the client ID. Since it's a secret, expose it via a tiny backend call
        const configRes = await base44.functions.invoke("getPaypalConfig", {});
        const paypalClientId = configRes?.data?.clientId;

        if (!paypalClientId) throw new Error("PayPal not configured");

        const script = document.createElement("script");
        script.id = "paypal-sdk";
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=PHP&intent=capture`;
        script.async = true;
        script.onload = () => { setSdkReady(true); setLoading(false); };
        script.onerror = () => { setSdkError("Failed to load PayPal SDK"); setLoading(false); };
        document.body.appendChild(script);
      } catch (e) {
        setSdkError("PayPal configuration error: " + e.message);
        setLoading(false);
      }
    };

    loadSDK();
  }, [totalAmount, cartItems]);

  useEffect(() => {
    if (!sdkReady || renderedRef.current || !paypalContainerRef.current) return;
    renderedRef.current = true;

    window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 48,
      },
      createOrder: async () => {
        const res = await base44.functions.invoke("createPaypalOrder", {
          amount: totalAmount,
          currency: "PHP",
          items: cartItems,
          description: `GAMER Productions — ${cartItems.length} item(s)`,
        });
        if (res.data?.error) throw new Error(res.data.error);
        return res.data.orderId;
      },
      onApprove: async (data) => {
        const res = await base44.functions.invoke("capturePaypalPayment", {
          orderId: data.orderID,
          cartItems,
        });
        if (res.data?.error) throw new Error(res.data.error);
        if (res.data?.success) onSuccess(res.data);
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        onError("Payment failed. Please try again.");
      },
      onCancel: () => {
        onError("Payment was cancelled.");
      },
    }).render(paypalContainerRef.current);
  }, [sdkReady]);

  if (totalAmount <= 0) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
        <p className="text-gray-400 text-sm">Loading PayPal...</p>
      </div>
    );
  }

  if (sdkError) {
    return (
      <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-400 font-bold text-sm">PayPal Unavailable</p>
          <p className="text-red-300/70 text-xs mt-1">{sdkError}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-4 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <p className="text-gray-300 text-xs">Secure payment powered by PayPal Live</p>
      </div>
      <div ref={paypalContainerRef} className="paypal-buttons-container min-h-[50px]" />
    </div>
  );
}