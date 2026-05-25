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

    const { orderId, cartItems = [] } = await req.json();
    if (!orderId) return Response.json({ error: "Missing orderId" }, { status: 400 });

    const accessToken = await getPayPalAccessToken();

    // Capture the payment
    const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const capture = await res.json();
    if (!res.ok) throw new Error(`PayPal capture failed: ${JSON.stringify(capture)}`);

    const captureStatus = capture.status;
    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const capturedAmount = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
    
    console.log(`PayPal payment captured: orderId=${orderId} captureId=${captureId} status=${captureStatus} user=${user.email}`);

    if (captureStatus !== "COMPLETED") {
      return Response.json({ error: `Payment not completed. Status: ${captureStatus}` }, { status: 400 });
    }

    // Create transaction record
    await base44.entities.Transactions.create({
      customer_email: user.email,
      item_name: cartItems.map(i => i.listing_title || i.name || "Item").join(", "),
      amount: parseFloat(capturedAmount || 0),
      payment_status: "paid",
      paypal_order_id: orderId,
    });

    // Create order records and clear cart
    for (const item of cartItems) {
      const itemPrice = parseFloat(item.price || 0);
      await base44.entities.Order.create({
        buyer_email: user.email,
        seller_email: item.seller_email || "",
        listing_id: item.listing_id || item.id || "",
        listing_title: item.listing_title || item.name || "Item",
        amount: itemPrice,
        commission: parseFloat((itemPrice * 0.1).toFixed(2)),
        seller_payout: parseFloat((itemPrice * 0.9).toFixed(2)),
        payment_method: "paypal",
        payment_status: "paid",
        order_status: "confirmed",
        transaction_id: captureId || orderId,
      });

      if (item.id) {
        await base44.entities.Cart.delete(item.id);
      }
    }

    return Response.json({
      success: true,
      captureId,
      orderId,
      status: captureStatus,
      amount: capturedAmount,
    });
  } catch (error) {
    console.error("capturePaypalPayment error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});