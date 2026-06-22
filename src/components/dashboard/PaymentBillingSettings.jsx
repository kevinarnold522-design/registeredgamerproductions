import React from "react";
import { CreditCard, Wallet } from "lucide-react";
import PaymentSettingsTab from "./PaymentSettingsTab";
import StripeConnect from "@/components/payments/StripeConnect";

// Unified Payment & Billing Settings — available to every user (buyers, creators, businesses).
// Lets anyone connect PayPal and/or Stripe to send and receive payments.
export default function PaymentBillingSettings({ user, profile, onProfileUpdate }) {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-white font-black text-2xl mb-1 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-green-400" /> Payment & Billing Settings
        </h2>
        <p className="text-gray-400 text-sm">
          Connect a payment method to make purchases and receive payouts. You can link PayPal, Stripe, or both.
        </p>
      </div>

      {/* PayPal */}
      <section>
        <PaymentSettingsTab profile={profile} user={user} onProfileUpdate={onProfileUpdate} />
      </section>

      {/* Stripe */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-black text-lg">Stripe (Card Payments)</h3>
        </div>
        <StripeConnect profile={profile} onProfileUpdate={onProfileUpdate} />
      </section>
    </div>
  );
}