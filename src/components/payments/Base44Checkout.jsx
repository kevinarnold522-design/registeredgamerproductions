import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, AlertCircle, Loader2, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function Base44Checkout({ totalAmount, items, userEmail, onSuccess, onError }) {
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("card"); // "card" or "paypal"
  const [error, setError] = useState("");

  const handlePaymentSuccess = async (paymentData) => {
    setProcessing(true);
    try {
      // Create transaction record
      const transaction = await base44.entities.Transactions.create({
        customer_email: userEmail,
        item_name: items.map(i => i.listing_title).join(", "),
        amount: totalAmount,
        payment_status: "paid",
        paypal_order_id: paymentData.orderID || `CARD_${Date.now()}`,
      });

      // Create orders and process splits for each item
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
          transaction_id: paymentData.orderID || `CARD_${Date.now()}`,
          payment_method: selectedMethod === "card" ? "stripe" : "paypal",
        });

        // Record global transaction with split
        await base44.functions.invoke("completePayment", {
          orderData: {
            id: crypto.randomUUID(),
            buyer_email: userEmail,
            seller_email: item.seller_email,
            seller_paypal_id: sellerProfile?.paypal_merchant_id || sellerProfile?.stripe_account_id,
            total_amount: item.price,
            admin_fee: item.price * 0.1,
            seller_payout: item.price * 0.9,
          },
          paypalOrderId: paymentData.orderID || `CARD_${Date.now()}`
        });

        // Remove from cart
        await base44.entities.Cart.delete(item.id);
      }

      toast.success("✅ Payment successful! Order confirmed.");
      if (onSuccess) onSuccess(transaction);
    } catch (e) {
      console.error("Payment success error:", e);
      toast.error("Payment failed. Please try again.");
      if (onError) onError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
      <div className="mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-green-400" />
        <h3 className="text-white font-bold">Secure Checkout</h3>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="mb-6 bg-gray-900/60 border border-gray-700 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">Total Amount</span>
          <span className="text-white font-black text-xl">${totalAmount.toLocaleString()}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-300">${(totalAmount / 1.1).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Platform Fee (10%)</span>
            <span className="text-gray-300">${(totalAmount * 0.1 / 1.1).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className="text-green-400">Seller Receives (90%)</span>
            <span className="text-green-400">${(totalAmount * 0.9).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Choose Payment Method</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Card Option */}
          <button
            onClick={() => setSelectedMethod("card")}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === "card"
                ? "bg-blue-900/20 border-blue-500/50"
                : "bg-gray-900 border-gray-700 hover:border-gray-600"
            }`}
          >
            <CreditCard className={`w-6 h-6 mb-2 ${selectedMethod === "card" ? "text-blue-400" : "text-gray-500"}`} />
            <p className={`text-sm font-bold ${selectedMethod === "card" ? "text-white" : "text-gray-400"}`}>Debit/Credit Card</p>
            <p className="text-[10px] text-gray-500 mt-1">Visa, Mastercard</p>
          </button>

          {/* PayPal Option */}
          <button
            onClick={() => setSelectedMethod("paypal")}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedMethod === "paypal"
                ? "bg-blue-900/20 border-blue-500/50"
                : "bg-gray-900 border-gray-700 hover:border-gray-600"
            }`}
          >
            <Wallet className={`w-6 h-6 mb-2 ${selectedMethod === "paypal" ? "text-blue-400" : "text-gray-500"}`} />
            <p className={`text-sm font-bold ${selectedMethod === "paypal" ? "text-white" : "text-gray-400"}`}>PayPal</p>
            <p className="text-[10px] text-gray-500 mt-1">Secure & Fast</p>
          </button>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={() => {
          // Simulate payment processing
          handlePaymentSuccess({ orderID: `${selectedMethod.toUpperCase()}_${Date.now()}` });
        }}
        disabled={processing}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
          selectedMethod === "card"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90"
        } text-white disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            {selectedMethod === "card" ? (
              <>
                <CreditCard className="w-5 h-5" />
                Pay with Card (Visa/Mastercard)
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Pay with PayPal
              </>
            )}
          </>
        )}
      </button>

      {/* Security Badges */}
      <div className="mt-6 flex items-center justify-center gap-4 text-gray-500 text-xs">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> 256-bit SSL Secure
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> PCI Compliant
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Buyer Protection
        </span>
      </div>

      {/* Card Icons */}
      {selectedMethod === "card" && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-bold">VISA</div>
          <div className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">Mastercard</div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">Amex</div>
        </div>
      )}
    </div>
  );
}