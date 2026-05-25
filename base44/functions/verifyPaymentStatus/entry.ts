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

    const { orderId } = await req.json();
    if (!orderId) return Response.json({ error: "Missing orderId" }, { status: 400 });

    const accessToken = await getPayPalAccessToken();

    const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    const order = await res.json();
    if (!res.ok) throw new Error(`PayPal verify failed: ${JSON.stringify(order)}`);

    return Response.json({
      orderId: order.id,
      status: order.status,
      amount: order.purchase_units?.[0]?.amount?.value,
      currency: order.purchase_units?.[0]?.amount?.currency_code,
    });
  } catch (error) {
    console.error("verifyPaymentStatus error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});