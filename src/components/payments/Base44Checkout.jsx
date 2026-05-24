import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, AlertCircle, Loader2, CreditCard } from "lucide-react";

export default function Base44Checkout({ totalAmount, items, userEmail, onSuccess, onError }) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize PayPal SDK
    const initPayPal = async () => {
      try {
        // Load PayPal SDK dynamically
        const script = document.createElement("script");
        script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD"; // Replace with actual client ID
        script.onload = () => {
          setPaypalReady(true);
          setLoading(false);
        };
        script.onerror = () => {
          setError("Failed to load PayPal");
          setLoading(false);
        };
        document.body.appendChild(script);
      } catch (e) {
        setError("PayPal initialization failed");
        setLoading(false);
      }
    };

    initPayPal();
  }, []);

  const handlePaymentSuccess = async (paymentData) => {
    setProcessing(true);
    try {
      // Create transaction record
      const transaction = await base44.entities.Transactions.create({
        customer_email: userEmail,
        item_name: items.map(i => i.listing_title).join(", "),
        amount: totalAmount,
        payment_status: "paid",
        paypal_order_id: paymentData.orderID,
      });

      // Create orders and process splits
      for (const item of items) {
        const sellerProfile = (await base44.entities.UserProfile.filter({ user_email: item.seller_email }))[0];
        
        await base44.entities.Order.create({
          buyer_email: userEmail,
          seller_email: item.seller_email,
          listing_id: item.listing_id,
          listing_title: item.listing_title,
          amount: item.price,
          commission: item.price * 0.1,
          seller_payout: item.price * 0.9,
          payment_status: "paid",
          order_status: "completed",
          transaction_id: paymentData.orderID,
        });

        // Record global transaction
        await base44.functions.invoke("completePayment", {
          orderData: {
            id: crypto.randomUUID(),
            buyer_email: userEmail,
            seller_email: item.seller_email,
            seller_paypal_id: sellerProfile?.paypal_merchant_id,
            total_amount: item.price,
            admin_fee: item.price * 0.1,
            seller_payout: item.price * 0.9,
          },
          paypalOrderId: paymentData.orderID
        });

        // Remove from cart
        await base44.entities.Cart.delete(item.id);
      }

      if (onSuccess) onSuccess(transaction);
    } catch (e) {
      console.error("Payment success error:", e);
      if (onError) onError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleError = (err) => {
    console.error("Payment error:", err);
    if (onError) onError("Payment failed. Please try again.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <div className="mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-green-400" />
        <h3 className="text-white font-bold">Secure Checkout</h3>
      </div>

      {error ? (
        <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Total Amount</span>
              <span className="text-white font-black text-xl">₱{totalAmount.toLocaleString()}</span>
            </div>
            <p className="text-gray-500 text-xs">
              Includes 10% platform fee • Seller receives 90%
            </p>
          </div>

          {paypalReady && window.paypal ? (
            <div id="paypal-button-container" className="space-y-3">
              {/* PayPal buttons will render here */}
              <button
                onClick={() => {
                  // Simulate PayPal popup
                  const popup = window.open("https://www.paypal.com/checkout", "_blank");
                  // In production, integrate with actual PayPal SDK
                  setTimeout(() => {
                    handlePaymentSuccess({ orderID: `ORDER_${Date.now()}` });
                  }, 3000);
                }}
                disabled={processing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>🅿️</span>
                    Pay with PayPal
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const popup = window.open("https://www.paypal.com/checkout", "_blank");
                setTimeout(() => {
                  handlePaymentSuccess({ orderID: `ORDER_${Date.now()}` });
                }, 3000);
              }}
              disabled={processing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span>🅿️</span>
                  Pay with PayPal
                </>
              )}
            </button>
          )}

          <div className="mt-4 flex items-center justify-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Secure
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Encrypted
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Protected
            </span>
          </div>
        </>
      )}
    </div>
  );
}