import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.3.1';

const GIFT_CATALOG = {
  diamond: { label: "Diamond", emoji: "💎", price: 199 },
  moneybag: { label: "Money Bag", emoji: "💰", price: 499 },
  gem_pack: { label: "Gem Pack", emoji: "💠", price: 999 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { gift_id, recipient_email, recipient_username, sender_email, sender_username, message } = body;

    const gift = GIFT_CATALOG[gift_id];
    if (!gift) {
      console.error("createGiftCheckout: unknown gift_id", gift_id);
      return Response.json({ error: "Unknown gift" }, { status: 400 });
    }
    if (!recipient_email || !sender_email) {
      return Response.json({ error: "Missing sender or recipient" }, { status: 400 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: "2024-06-20" });
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const baseUrl = origin.replace(/\/$/, "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `${gift.emoji} ${gift.label} gift for ${recipient_username || recipient_email}` },
          unit_amount: gift.price,
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}/profile?email=${encodeURIComponent(recipient_email)}&gift_sent=1`,
      cancel_url: `${baseUrl}/profile?email=${encodeURIComponent(recipient_email)}`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        kind: "gift",
        gift_id,
        gift_label: gift.label,
        gift_emoji: gift.emoji,
        paid_amount: String(gift.price),
        recipient_email,
        recipient_username: recipient_username || "",
        sender_email,
        sender_username: sender_username || "",
        message: (message || "").slice(0, 400),
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("createGiftCheckout error:", error?.message, error);
    return Response.json({ error: error?.message || "Checkout failed" }, { status: 500 });
  }
});