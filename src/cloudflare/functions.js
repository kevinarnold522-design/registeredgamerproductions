// =====================================================================
// Backend function handlers — Cloudflare port of the Base44 functions/.
// Each handler returns { status, body }. Logic is lifted from the Deno
// functions; the Base44 SDK calls become direct D1 writes (which the
// db.js layer auto-mirrors to Base44 as the backup).
//
// Ported & stubbed from the Base44 backend:
//   sendOrderNotification, salesNotification, completePayment,
//   createPaypalOrder, capturePaypalPayment, getPaypalConfig,
//   moderateListing, notifyNewMember, notifyNewContent, ...
// Fill in remaining handlers by lifting each Deno function body here.
// =====================================================================
import { createRecord, updateRecord, listRecords } from "./db.js";

export async function handleFunction(name, body, env, request) {
  switch (name) {
    case "sendOrderNotification":
      return sendOrderNotification(body, env);
    case "getPaypalConfig":
      return getPaypalConfig(body, env);
    case "createPaypalOrder":
      return createPaypalOrder(body, env);
    case "capturePaypalPayment":
      return capturePaypalPayment(body, env);
    case "moderateListing":
      return moderateListing(body, env);
    default:
      return { status: 404, body: { error: `Function '${name}' not ported yet` } };
  }
}

// ---- sendOrderNotification (port of functions/sendOrderNotification.js) ----
async function sendOrderNotification(body, env) {
  const { order_id, listing_id, buyer_email, seller_email, listing_title, amount } = body;

  await createRecord(env, "Notification", {
    user_email: buyer_email,
    type: "order",
    title: "Order Confirmed!",
    message: `Your purchase of "${listing_title}" for ₱${Number(amount).toLocaleString()} is confirmed.`,
    link: "/dashboard?tab=orders",
    related_id: order_id,
  });

  await createRecord(env, "Notification", {
    user_email: seller_email,
    type: "sale",
    title: "New Sale! 💰",
    message: `You sold "${listing_title}" for ₱${Number(amount).toLocaleString()}. Payout: ₱${(amount * 0.9).toLocaleString()}.`,
    link: "/dashboard?tab=sales",
    related_id: order_id,
  });

  if (listing_id) {
    const rows = await listRecords(env, "Listing", { id: listing_id }, 1);
    if (rows[0]) await updateRecord(env, "Listing", listing_id, { views: (rows[0].views || 0) + 1 });
  }

  return { status: 200, body: { success: true } };
}

// ---- getPaypalConfig ----
function getPaypalConfig(_body, env) {
  return { status: 200, body: { client_id: env.PAYPAL_CLIENT_ID, currency: "PHP" } };
}

// ---- PayPal: create order ----
async function createPaypalOrder(body, env) {
  const { amount, currency = "PHP" } = body;
  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const { access_token } = await tokenRes.json();
  const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: currency, value: String(amount) } }],
    }),
  });
  const order = await orderRes.json();
  return { status: 200, body: order };
}

// ---- PayPal: capture payment ----
async function capturePaypalPayment(body, env) {
  const { order_id } = body;
  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const { access_token } = await tokenRes.json();
  const capRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${order_id}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
  });
  const result = await capRes.json();
  return { status: 200, body: result };
}

// ---- moderateListing ----
async function moderateListing(body, env) {
  const { listing_id, action } = body;
  const status = action === "approve" ? "active" : "removed";
  await updateRecord(env, "Listing", listing_id, { status, is_approved: action === "approve" });
  return { status: 200, body: { success: true, status } };
}