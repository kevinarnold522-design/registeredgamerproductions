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

    const { orderId } = await req.json();
    if (!orderId) return Response.json({ error: "Missing orderId" }, { status: 400 });

    const accessToken = await getPayPalAccessToken();

    // First verify the order details before capturing
    const verifyRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
    const orderDetails = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(`Order verification failed: ${JSON.stringify(orderDetails)}`);

    // Validate: must be $1.00 USD and not already captured
    const unit = orderDetails.purchase_units?.[0];
    const amount = parseFloat(unit?.amount?.value || 0);
    const currency = unit?.amount?.currency_code;
    if (amount !== 1.00 || currency !== "USD") {
      return Response.json({ error: "Invalid payment amount" }, { status: 400 });
    }
    if (orderDetails.status === "COMPLETED") {
      return Response.json({ error: "Order already captured" }, { status: 400 });
    }

    // Capture the payment
    const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const capture = await captureRes.json();
    if (!captureRes.ok) throw new Error(`Capture failed: ${JSON.stringify(capture)}`);
    if (capture.status !== "COMPLETED") {
      return Response.json({ error: `Payment not completed: ${capture.status}` }, { status: 400 });
    }

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const capturedAmount = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
    console.log(`Tier1 captured: orderId=${orderId} captureId=${captureId} user=${user.email} amount=${capturedAmount}`);

    // Activate subscription in DB (service role so no RLS issues)
    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    await base44.asServiceRole.entities.Tier1Subscription.create({
      user_email: user.email,
      username: user.full_name,
      paypal_order_id: orderId,
      amount: 1,
      status: "active",
      start_date: now.toISOString(),
      expiry_date: expiry.toISOString(),
      is_verified: true,
    });

    // Log in global transactions
    await base44.asServiceRole.entities.GlobalTransactions.create({
      payer_email: user.email,
      item_name: "Tier 1 Verified Partner Subscription",
      amount: 1,
      currency: "USD",
      payment_method: "paypal",
      paypal_order_id: orderId,
      paypal_capture_id: captureId,
      status: "paid",
    });

    // Send thank-you email
    const expiryStr = expiry.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: "🎮 Welcome to Tier 1 Verified Partner — GAMER.PRODUCTIONS",
      body: `Hi ${user.full_name},\n\nThank you for your $1 Tier 1 Verified Partner subscription!\n\n✅ Subscription Status: ACTIVE\n📅 Expires: ${expiryStr}\n🧾 PayPal Order: ${orderId}\n\n🌟 YOUR TIER 1 BENEFITS:\n✓ Post & comment in ALL Gaming Communities\n✓ Verified Partner Purple Checkmark badge\n🚫 Ad-Free Experience — All advertisements removed\n✓ Exclusive Tier 1 Group Chat access\n✓ Automatic email alerts for new listings in your joined groups\n✓ Chat any user on the platform\n✓ Request new gaming categories & subcategories\n✓ Unlock animated profile avatars & exclusive skins\n\nWelcome to the family!\n\n— Kevin & The GAMER.PRODUCTIONS Team`,
    });

    return Response.json({ success: true, captureId, expiryDate: expiry.toISOString() });
  } catch (error) {
    console.error("captureTier1Payment error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});