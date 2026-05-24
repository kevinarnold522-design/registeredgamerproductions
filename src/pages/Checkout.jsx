import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { CheckCircle, AlertCircle, Loader2, ShoppingCart, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paypalLoading, setPaypalLoading] = useState(true);
  const [paypalLinked, setPaypalLinked] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [transaction, setTransaction] = useState(null);

  // Get cart items
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me) {
          const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
          if (profiles.length > 0) {
            setProfile(profiles[0]);
            setPaypalLinked(!!profiles[0].paypal_email);
          } else {
            // Auto-create profile for existing users
            const newProfile = await base44.entities.UserProfile.create({
              user_email: me.email,
              username: me.full_name || me.email.split('@')[0],
              display_name: me.full_name || me.email.split('@')[0],
              account_type: "regular",
              joined_date: new Date().toISOString(),
            });
            setProfile(newProfile);
            setPaypalLinked(!!newProfile.paypal_email);
          }

          // Load cart
          const cart = await base44.entities.Cart.filter({ user_email: me.email });
          setCartItems(cart);
          const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
          setTotalAmount(total);
        }
      } catch (e) {
        console.error("Auth error:", e);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Initialize PayPal
  useEffect(() => {
    if (paypalLinked && typeof window !== "undefined") {
      setPaypalLoading(false);
    }
  }, [paypalLinked]);

  const initiatePayment = async () => {
    if (!paypalLinked) {
      setErrorMessage("Please link your PayPal account first");
      return;
    }

    setPaymentStatus("processing");
    setErrorMessage("");

    try {
      // Create transaction record
      const newTransaction = await base44.entities.Transactions.create({
        customer_email: user.email,
        item_name: cartItems.map(i => i.listing_title).join(", "),
        amount: totalAmount,
        payment_status: "pending",
        paypal_order_id: "",
      });

      setTransaction(newTransaction);

      // Redirect to PayPal
      window.location.href = `https://www.paypal.com/checkout?amount=${totalAmount}&email=${encodeURIComponent(user.email)}`;
    } catch (error) {
      setPaymentStatus("error");
      setErrorMessage("Failed to initiate payment. Please try again.");
      console.error(error);
    }
  };

  // Handle PayPal redirect back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("paymentId");
    const token = params.get("token");
    const payerId = params.get("PayerID");

    if (paymentId && token && payerId && transaction) {
      handlePaymentSuccess(paymentId, token, payerId);
    }
  }, [transaction]);

  const handlePaymentSuccess = async (paymentId, token, payerId) => {
    try {
      // Update transaction
      await base44.entities.Transactions.update(transaction.id, {
        payment_status: "paid",
        paypal_order_id: paymentId,
      });

      // Create orders for each item
      for (const item of cartItems) {
        await base44.entities.Order.create({
          buyer_email: user.email,
          seller_email: item.seller_email,
          listing_id: item.listing_id,
          listing_title: item.listing_title,
          amount: item.price,
          commission: item.price * 0.1, // 10% commission
          seller_payout: item.price * 0.9,
          payment_status: "paid",
          order_status: "confirmed",
          transaction_id: paymentId,
        });

        // Remove from cart
        await base44.entities.Cart.delete(item.id);
      }

      setPaymentStatus("success");
      setCartItems([]);
    } catch (error) {
      setPaymentStatus("error");
      setErrorMessage("Payment completed but order creation failed. Please contact support.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    window.location.href = "/";
    return null;
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <AuthNavbar user={user} profile={profile} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-green-600/40 rounded-3xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-white font-black text-2xl mb-2">Payment Successful!</h1>
          <p className="text-gray-400 text-sm mb-6">Thank you! Your transaction is complete.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <AuthNavbar user={user} profile={profile} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-white font-black text-2xl mb-6">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6"
          >
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-400" />
              Order Summary
            </h2>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Your cart is empty</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 px-6 py-2 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-300 text-sm font-semibold hover:bg-purple-600/30 transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
                    {item.listing_image ? (
                      <img src={item.listing_image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center text-2xl">🎮</div>
                    )}
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{item.listing_title}</p>
                      <p className="text-purple-400 font-black text-sm">₱{item.price?.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="text-white font-black text-xl">₱{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-6"
          >
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              Secure Payment
            </h2>

            {paypalLinked ? (
              <div className="bg-green-900/20 border border-green-600/40 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 font-bold text-sm">PayPal Successfully Linked</p>
                </div>
                <p className="text-gray-400 text-xs">
                  You're ready to make payments and receive payouts via PayPal.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-400 font-bold text-sm">PayPal Not Linked</p>
                </div>
                <p className="text-gray-400 text-xs mb-3">
                  Please link your PayPal account to proceed with payment.
                </p>
                <a
                  href="/profile"
                  className="block w-full py-2 rounded-lg bg-yellow-600/20 border border-yellow-600/40 text-yellow-300 text-sm font-semibold text-center hover:bg-yellow-600/30 transition-colors"
                >
                  Go to Profile →
                </a>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-3 mb-4">
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}

            <button
              onClick={initiatePayment}
              disabled={!paypalLinked || cartItems.length === 0 || paymentStatus === "processing"}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {paymentStatus === "processing" ? (
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

            <p className="text-gray-500 text-xs text-center mt-4">
              🔒 Secure 256-bit SSL encryption
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}