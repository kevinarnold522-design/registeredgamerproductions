import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, CheckCircle, ArrowLeft } from "lucide-react";
import PayPalCheckout from "@/components/payments/PayPalCheckout";

export default function Checkout() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const items = await base44.entities.Cart.filter({ user_email: me.email });
        setCartItems(items);
      } catch (e) {
        base44.auth.redirectToLogin("/checkout");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const handleSuccess = () => {
    setSuccess(true);
  };

  const handleError = (msg) => {
    alert(msg);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-gray-900 border border-green-700/40 rounded-2xl p-10 max-w-md mx-4"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-white font-black text-2xl mb-2">Payment Successful!</h2>
          <p className="text-gray-400 text-sm mb-6">Your order has been placed and the seller has been notified.</p>
          <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:opacity-90 transition-opacity">
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-2xl font-black mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-purple-400" /> Checkout
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <ShoppingCart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">Your cart is empty.</p>
            <Link to="/" className="mt-4 inline-block px-5 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90">Browse Listings</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-3">Order Summary</h2>
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    {item.listing_image && <img src={item.listing_image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <p className="text-sm text-gray-200 font-medium">{item.listing_title}</p>
                  </div>
                  <p className="text-purple-400 font-bold">₱{(item.price || 0).toLocaleString()}</p>
                </div>
              ))}
              <div className="flex justify-between mt-3 pt-3 border-t border-gray-700">
                <p className="text-gray-300 font-bold">Total</p>
                <p className="text-green-400 font-black text-lg">₱{totalAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* PayPal Checkout */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-4">Pay with PayPal</h2>
              <PayPalCheckout
                cartItems={cartItems}
                totalAmount={totalAmount}
                userEmail={user?.email}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}