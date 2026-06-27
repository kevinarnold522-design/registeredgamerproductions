import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trash2, ShoppingCart } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FavoritesDropdown({ isOpen, onClose, userEmail }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userEmail) {
      setLoading(true);
      base44.entities.Favorite.filter({ user_email: userEmail })
        .then((r) => {
          setItems(Array.isArray(r) ? r : []);
          setLoading(false);
        })
        .catch(() => {
          setItems([]);
          setLoading(false);
        });
    }
  }, [isOpen, userEmail]);

  const removeItem = async (id) => {
    await base44.entities.Favorite.delete(id);
    setItems(items.filter((i) => i.id !== id));
  };

  const addToCart = async (item) => {
    await base44.entities.Cart.create({
      user_email: userEmail,
      listing_id: item.listing_id,
      listing_title: item.listing_title,
      listing_image: item.listing_image,
      price: item.price,
      quantity: 1,
    });
    alert("Added to cart!");
  };

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
                <Heart className="w-5 h-5 text-pink-400" />
                <h2 className="text-white font-bold text-lg">Favourites ({items.length})</h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && <p className="text-gray-500 text-center py-8">Loading...</p>}
              {!loading && items.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No favourites yet</p>
                </div>
              )}
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-gray-900 rounded-xl p-3 border border-gray-800">
                  {item.listing_image && (
                    <img src={item.listing_image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{item.listing_title}</p>
                    <p className="text-pink-400 font-bold mt-1">${item.price?.toLocaleString()}</p>
                    <button onClick={() => addToCart(item)} className="flex items-center gap-1 text-purple-400 text-xs mt-1 hover:text-purple-300 transition-colors">
                      <ShoppingCart className="w-3 h-3" /> Add to Cart
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}