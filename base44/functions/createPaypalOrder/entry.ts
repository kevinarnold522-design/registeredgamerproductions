import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
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

    const { amount, currency = "PHP", items = [], description = "GAMER Productions Purchase" } = await req.json();
    
    if (!amount || amount <= 0) return Response.json({ error: "Invalid amount" }, { status: 400 });

    const accessToken = await getPayPalAccessToken();

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: parseFloat(amount).toFixed(2),
          breakdown: {
            item_total: { currency_code: currency, value: parseFloat(amount).toFixed(2) }
          }
        },
        description,
        items: items.length > 0 ? items.map(i => ({
          name: (i.listing_title || i.name || "Item").substring(0, 127),
          unit_amount: { currency_code: currency, value: parseFloat(i.price || 0).toFixed(2) },
          quantity: String(i.quantity || 1),
        })) : [{
          name: description.substring(0, 127),
          unit_amount: { currency_code: currency, value: parseFloat(amount).toFixed(2) },
          quantity: "1",
        }],
      }],
      application_context: {
        brand_name: "GAMER Productions",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
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

    console.log(`PayPal order created: ${order.id} for user ${user.email}, amount ${amount} ${currency}`);

    return Response.json({ orderId: order.id, status: order.status });
  } catch (error) {
    console.error("createPaypalOrder error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});