import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal auth failed: ${data.error_description || JSON.stringify(data)}`);
  return data.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Check if already has active subscription
    const existing = await base44.entities.Tier1Subscription.filter({ user_email: user.email, status: "active" });
    if (existing.length > 0) {
      return Response.json({ error: "Already subscribed" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: "1.00",
          breakdown: {
            item_total: { currency_code: "USD", value: "1.00" }
          }
        },
        description: "Tier 1 Verified Partner — GAMER.PRODUCTIONS (Annual)",
        items: [{
          name: "Tier 1 Verified Partner Subscription",
          unit_amount: { currency_code: "USD", value: "1.00" },
          quantity: "1",
          description: "1-year Verified Partner membership with ad-free access",
        }],
      }],
      application_context: {
        brand_name: "GAMER.PRODUCTIONS",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: `${req.headers.get("origin") || "https://app.base44.com"}/payment?tier1=success`,
        cancel_url: `${req.headers.get("origin") || "https://app.base44.com"}/payment?tier1=cancel`,
      }
    };

    const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const order = await res.json();
    if (!res.ok) throw new Error(`PayPal order creation failed: ${JSON.stringify(order)}`);

    // Find the approval URL
    const approvalUrl = order.links?.find(l => l.rel === "approve")?.href;
    if (!approvalUrl) throw new Error("No approval URL from PayPal");

    console.log(`Tier1 order created: ${order.id} for user ${user.email}`);

    return Response.json({ orderId: order.id, approvalUrl });
  } catch (error) {
    console.error("createTier1Order error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});