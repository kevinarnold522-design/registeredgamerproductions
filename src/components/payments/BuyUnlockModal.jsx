import React from "react";
import { motion } from "framer-motion";
import { X, Lock, ShieldCheck } from "lucide-react";
import PayPalCheckout from "@/components/payments/PayPalCheckout";
import { formatListingPrice } from "@/lib/currency";
import ListingImageFrame from "@/components/listings/ListingImageFrame";

// Buy-to-unlock modal for paid listings/mods.
// Runs the PayPal checkout for a single listing; on success calls onPaid().
export default function BuyUnlockModal({ listing, user, onClose, onPaid }) {
  const cartItems = [{
    listing_id: listing.id,
    listing_title: listing.title,
    name: listing.title,
    price: Number(listing.price) || 0,
    quantity: 1,
    seller_email: listing.seller_email || "",
  }];

  const inIframe = (() => { try { return window.self !== window.top; } catch { return true; } })();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-gray-950 border border-purple-700/40 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-300" /> Buy to Unlock Download
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400 hover:text-white" /></button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900 border border-gray-800 mb-4">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
            {listing.images?.[0]
              ? <ListingImageFrame
                  src={listing.images[0]}
                  alt={listing.title || "Listing"}
                  fallbackCategory={listing.category || "Listing"}
                  className="w-full h-full"
                  foregroundClassName="w-full h-full object-cover"
                  backgroundClassName="w-full h-full object-cover opacity-35"
                />
              : <div className="w-full h-full" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{listing.title}</p>
            <p className="text-purple-300 font-black text-base">{formatListingPrice(listing.price, listing.currency)}</p>
          </div>
        </div>

        {inIframe ? (
          <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-xl p-4 text-center">
            <p className="text-yellow-300 text-sm font-bold">Open the published app to complete checkout.</p>
            <p className="text-yellow-200/70 text-xs mt-1">Payments can't run inside the editor preview.</p>
          </div>
        ) : (
          <PayPalCheckout
            cartItems={cartItems}
            totalAmount={Number(listing.price) || 0}
            userEmail={user?.email}
            onSuccess={() => onPaid()}
            onError={(msg) => { if (msg) console.warn(msg); }}
          />
        )}

        <p className="text-gray-500 text-[11px] mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> After payment, your download unlocks instantly.
        </p>
      </motion.div>
    </motion.div>
  );
}
