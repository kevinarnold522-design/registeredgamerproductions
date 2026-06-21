import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@17.3.1';

// Records a paid Gift record once Stripe confirms the payment.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), { apiVersion: "2024-06-20" });

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const body = await req.text();

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("giftWebhook signature verification failed:", err?.message);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const m = session.metadata || {};
      if (m.kind === "gift" && m.recipient_email && m.sender_email) {
        await base44.asServiceRole.entities.Gift.create({
          sender_email: m.sender_email,
          sender_username: m.sender_username || "",
          recipient_email: m.recipient_email,
          recipient_username: m.recipient_username || "",
          gift_id: m.gift_id,
          gift_label: m.gift_label,
          gift_emoji: m.gift_emoji,
          gift_type: "paid",
          paid_amount: Number(m.paid_amount || 0),
          currency: "usd",
          message: m.message || "",
          payment_status: "paid",
        });

        await base44.asServiceRole.entities.Notification.create({
          user_email: m.recipient_email,
          type: "system",
          title: `${m.gift_emoji} You received a gift!`,
          message: `${m.sender_username || "A gamer"} sent you a ${m.gift_label}.`,
          link: "/profile",
        }).catch(() => {});

        console.log("giftWebhook: recorded paid gift", m.gift_id, "->", m.recipient_email);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("giftWebhook error:", error?.message, error);
    return Response.json({ error: error?.message || "Webhook failed" }, { status: 500 });
  }
});