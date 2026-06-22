import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CartDropdown({ isOpen, onClose, userEmail }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userEmail) {
      setLoading(true);
      base44.entities.Cart.filter({ user_email: userEmail }).then((r) => {
        setItems(r);
        setLoading(false);
      });
    }
  }, [isOpen, userEmail]);

  const removeItem = async (id) => {
    await base44.entities.Cart.delete(id);
    setItems(items.filter((i) => i.id !== id));
  };

  const total = items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-gray-950 border-l border-gray-800 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-400" />
                <h2 className="text-white font-bold text-lg">Cart ({items.length})</h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && <p className="text-gray-500 text-center py-8">Loading...</p>}
              {!loading && items.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              )}
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-gray-900 rounded-xl p-3 border border-gray-800">
                  {item.listing_image && (
                    <img src={item.listing_image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{item.listing_title}</p>
                    <p className="text-purple-400 font-bold mt-1">${item.price?.toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-gray-800">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400 font-medium">Total</span>
                  <span className="text-white font-black text-lg">${total.toLocaleString()}</span>
                </div>
                <a href="/checkout"
                  className="block w-full text-center py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity">
                  Proceed to Checkout
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}