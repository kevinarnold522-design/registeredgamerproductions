// Cloudflare Worker functions — payments, emails, notifications, uploads.
// Data and Auth are handled by Supabase.
const MASTER_EMAIL = "kevinarnold522@gmail.com";
const ADMIN_EMAILS = ["kevinjersey2019@gmail.com", "arnoldk137@gmail.com", "kevinarnold522@gmail.com"];
const BUCKET = "gamerproductionsmedia";
const MAX_BYTES = 25 * 1024 * 1024;

export async function handleFunction(name, body, env, request) {
  switch (name) {
    case "api/hello":              return { status: 200, body: { message: "Hello from Cloudflare Worker" } };
    case "getPaypalConfig":        return getPaypalConfig(body, env);
    case "createPaypalOrder":      return createPaypalOrder(body, env, request);
    case "capturePaypalPayment":   return capturePaypalPayment(body, env);
    case "verifyPaymentStatus":    return verifyPaymentStatus(body, env);
    case "completePayment":        return { status: 200, body: { success: true, message: "Record in Supabase." } };
    case "createTier1Order":       return createTier1Order(body, env, request);
    case "captureTier1Payment":    return captureTier1Payment(body, env);
    case "connectSellerPaypal":    return connectSellerPaypal(body);
    case "getSellerPaypalStatus":  return { status: 200, body: { connected: false } };
    case "createGiftCheckout":     return createGiftCheckout(body, env);
    case "sendOrderNotification":  return sendOrderNotification(body, env);
    case "salesNotification":      return salesNotification(body, env);
    case "notifyNewMember":        return notifyNewMember(body, env);
    case "notifyNewContent":       return notifyNewContent(body, env);
    case "copyrightViolationAlert":return copyrightViolationAlert(body, env);
    case "sendDailyRewardEmail":   return sendDailyRewardEmail(body, env);
    case "sendPaypalGuideEmail":   return sendPaypalGuideEmail(body, env);
    case "dailyUpdatesEmail":      return dailyUpdatesEmail(body, env);
    case "biweeklyReport":         return biweeklyReport(body, env);
    case "moderateListing":        return moderateListing(body, env);
    case "deleteListingPermanent": return deleteListingPermanent(body, env);
    case "uploadToR2":             return uploadToR2(body, env);
    case "createSupabaseUpload":   return createSupabaseUpload(body, env);
    case "listMedia":              return listMedia(body, env);
    case "logLogin":               return { status: 200, body: { ok: true } };
    case "updateProfileMedia":     return { status: 200, body: { ok: true } };
    default: return { status: 404, body: { error: "Function '" + name + "' not found" } };
  }
}

async function sendEmail(env, opts) {
  if (!env.BASE44_SERVICE_TOKEN || !env.BASE44_APP_ID) return;
  try { await fetch("https://app.base44.com/api/apps/" + env.BASE44_APP_ID + "/integrations/Core/SendEmail", { method: "POST", headers: { "Content-Type": "application/json", api_key: env.BASE44_SERVICE_TOKEN }, body: JSON.stringify(opts) }); } catch (e) { console.error("sendEmail:", e.message); }
}

async function getPayPalAccessToken(env) {
  const cid = env.PAYPAL_CLIENT_ID, cs = env.PAYPAL_CLIENT_SECRET;
  if (!cid || !cs) throw new Error("PayPal not configured");
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", { method: "POST", headers: { Authorization: "Basic " + btoa(cid + ":" + cs), "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
  const d = await res.json(); if (!res.ok) throw new Error("PayPal auth failed"); return d.access_token;
}

function safePath(folder, fileName) {
  const n = String(fileName || "upload").replace(/[^a-zA-Z0-9._-]/g, "-");
  const ext = n.includes(".") ? n.split(".").pop() : "bin";
  const f = String(folder || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "-");
  return f + "/" + Date.now() + "-" + crypto.randomUUID().slice(0, 8) + "." + ext.toLowerCase();
}

function getPaypalConfig(_, env) { return { status: 200, body: { client_id: env.PAYPAL_CLIENT_ID, currency: "USD" } }; }

async function createPaypalOrder(body, env, req) {
  const at = await getPayPalAccessToken(env); const origin = (req && req.headers.get("origin")) || "https://app.base44.com";
  const items = body.items && body.items.length ? body.items.map(i => ({ name: i.name || "Item", unit_amount: { currency_code: body.currency || "USD", value: parseFloat(i.price || 0).toFixed(2) }, quantity: String(i.quantity || 1) })) : [{ name: (body.description || "Purchase").slice(0, 127), unit_amount: { currency_code: body.currency || "USD", value: parseFloat(body.amount || 0).toFixed(2) }, quantity: "1" }];
  const payload = { intent: "CAPTURE", purchase_units: [{ amount: { currency_code: body.currency || "USD", value: parseFloat(body.amount || 0).toFixed(2), breakdown: { item_total: { currency_code: body.currency || "USD", value: parseFloat(body.amount || 0).toFixed(2) } } }, description: body.description || "GAMER Productions Purchase", items }], application_context: { brand_name: "GAMER.PRODUCTIONS", user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING", return_url: origin + "/payment?success=1", cancel_url: origin + "/payment?cancelled=1" } };
  const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", { method: "POST", headers: { Authorization: "Bearer " + at, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const order = await res.json(); if (!res.ok) throw new Error("PayPal order failed"); const url = order.links && order.links.find(l => l.rel === "approve"); return { status: 200, body: { orderId: order.id, approvalUrl: url && url.href } };
}

async function capturePaypalPayment(body, env) {
  if (!body.orderId) return { status: 400, body: { error: "Missing orderId" } };
  const at = await getPayPalAccessToken(env); const res = await fetch("https://api-m.paypal.com/v2/checkout/orders/" + body.orderId + "/capture", { method: "POST", headers: { Authorization: "Bearer " + at, "Content-Type": "application/json" } }); const cap = await res.json(); if (!res.ok) throw new Error("Capture failed"); return { status: 200, body: { success: true, capture: cap } };
}

async function verifyPaymentStatus(body, env) {
  if (!body.orderId) return { status: 400, body: { error: "Missing orderId" } };
  const at = await getPayPalAccessToken(env); const res = await fetch("https://api-m.paypal.com/v2/checkout/orders/" + body.orderId, { headers: { Authorization: "Bearer " + at } }); const o = await res.json(); if (!res.ok) throw new Error("Verify failed"); const u = o.purchase_units && o.purchase_units[0]; return { status: 200, body: { orderId: o.id, status: o.status, amount: u && u.amount && u.amount.value, currency: u && u.amount && u.amount.currency_code } };
}

async function createTier1Order(body, env, req) {
  const at = await getPayPalAccessToken(env); const origin = (req && req.headers.get("origin")) || "https://app.base44.com";
  const payload = { intent: "CAPTURE", purchase_units: [{ amount: { currency_code: "USD", value: "1.00", breakdown: { item_total: { currency_code: "USD", value: "1.00" } } }, description: "Tier 1 Verified Partner", items: [{ name: "Tier 1 Subscription", unit_amount: { currency_code: "USD", value: "1.00" }, quantity: "1", description: "1-year membership" }] }], application_context: { brand_name: "GAMER.PRODUCTIONS", user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING", return_url: origin + "/payment?tier1=success", cancel_url: origin + "/payment?tier1=cancel" } };
  const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", { method: "POST", headers: { Authorization: "Bearer " + at, "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const o = await res.json(); if (!res.ok) throw new Error("PayPal order failed"); const url = o.links && o.links.find(l => l.rel === "approve"); return { status: 200, body: { orderId: o.id, approvalUrl: url && url.href } };
}

async function captureTier1Payment(body, env) {
  if (!body.orderId) return { status: 400, body: { error: "Missing orderId" } };
  const at = await getPayPalAccessToken(env); const vr = await fetch("https://api-m.paypal.com/v2/checkout/orders/" + body.orderId, { headers: { Authorization: "Bearer " + at } }); const od = await vr.json(); if (!vr.ok) throw new Error("Verify failed"); const u = od.purchase_units && od.purchase_units[0]; if (parseFloat(u && u.amount && u.amount.value) !== 1.0) return { status: 400, body: { error: "Invalid amount" } }; if (od.status === "COMPLETED") return { status: 400, body: { error: "Already captured" } }; const cr = await fetch("https://api-m.paypal.com/v2/checkout/orders/" + body.orderId + "/capture", { method: "POST", headers: { Authorization: "Bearer " + at, "Content-Type": "application/json" } }); const cap = await cr.json(); if (!cr.ok) throw new Error("Capture failed"); return { status: 200, body: { success: true, capture: cap } };
}

function connectSellerPaypal(body) {
  if (!body.paypal_email) return { status: 400, body: { error: "Missing paypal_email" } };
  return { status: 200, body: { success: true, paypal_email: body.paypal_email } };
}

async function createGiftCheckout(body, env) {
  const CATALOG = { diamond: { label: "Diamond", price: 199 }, moneybag: { label: "Money Bag", price: 499 }, gem_pack: { label: "Gem Pack", price: 999 } };
  const g = CATALOG[body.gift_id]; if (!g) return { status: 400, body: { error: "Unknown gift" } };
  if (!body.recipient_email || !body.sender_email) return { status: 400, body: { error: "Missing sender or recipient" } };
  const sk = env.STRIPE_SECRET_KEY; if (!sk) return { status: 500, body: { error: "Stripe not configured" } };
  const params = new URLSearchParams(); params.set("mode", "payment"); params.set("line_items[0][price_data][currency]", "usd"); params.set("line_items[0][price_data][product_data][name]", g.label + " gift"); params.set("line_items[0][price_data][unit_amount]", String(g.price)); params.set("line_items[0][quantity]", "1"); params.set("success_url", "https://app.base44.com/profile?gift_sent=1"); params.set("cancel_url", "https://app.base44.com/profile");
  const sr = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: "Bearer " + sk, "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString() }); const s = await sr.json(); if (!sr.ok) return { status: 400, body: { error: (s.error && s.error.message) || "Checkout failed" } }; return { status: 200, body: { url: s.url } };
}

async function sendOrderNotification(body, env) {
  await sendEmail(env, { to: body.seller_email, subject: "New Order: " + body.listing_title, body: "Hi " + (body.seller_username || body.seller_email) + ",\n\nNew order: " + body.listing_title + " — $" + (body.amount || 0) + "\nBuyer: " + body.buyer_email + "\n\nGAMER Productions" }); return { status: 200, body: { success: true } };
}
async function salesNotification(body, env) {
  await sendEmail(env, { to: body.seller_email, subject: "Sale! " + body.listing_title + " — $" + (body.amount || 0), body: "Hi " + (body.seller_username || body.seller_email) + ",\n\nYour listing sold! " + body.listing_title + " — $" + (body.amount || 0) + "\n\nGAMER Productions" }); return { status: 200, body: { success: true } };
}
async function notifyNewMember(body, env) {
  if (body.community_owner_email) await sendEmail(env, { to: body.community_owner_email, subject: "New member in " + body.community_name, body: (body.new_member_username || body.new_member_email) + " joined " + body.community_name }); return { status: 200, body: { success: true } };
}
async function notifyNewContent(body, env) {
  const emails = []; (body.members || []).forEach(m => { if (m.user_email && emails.indexOf(m.user_email) === -1) emails.push(m.user_email); }); let sent = 0;
  for (let i = 0; i < Math.min(emails.length, 50); i++) { await sendEmail(env, { to: emails[i], subject: "New content in " + (body.community_name || "community"), body: body.title || "New content" }); sent++; } return { status: 200, body: { sent } };
}
async function copyrightViolationAlert(body, env) {
  await sendEmail(env, { to: body.creator_email, subject: "Copyright Alert: " + body.video_title, body: "Hi " + body.creator_username + ",\n\nYour video was flagged.\nVideo: " + body.video_title + "\nRisk: " + body.risk_level + "\n\nGAMER Productions" }); return { status: 200, body: { success: true } };
}
async function sendDailyRewardEmail(body, env) {
  if (!body.userEmail) return { status: 400, body: { error: "Missing userEmail" } };
  await sendEmail(env, { to: body.userEmail, subject: "Daily Reward — Streak: " + (body.streak || 0), body: "Hi " + (body.username || "Gamer") + ",\n\nClaim your reward! Streak: " + (body.streak || 0) + " days\n\nGAMER Productions" }); return { status: 200, body: { success: true } };
}
async function sendPaypalGuideEmail(body, env) {
  if (!body.email) return { status: 400, body: { error: "Missing email" } };
  await sendEmail(env, { to: body.email, subject: "Connect Your PayPal", body: "Hi " + (body.username || "there") + ",\n\n1. Dashboard > Settings\n2. Connect PayPal\n3. Log in\n\nGAMER Productions" }); return { status: 200, body: { success: true } };
}
async function dailyUpdatesEmail(body, env) {
  let sent = 0; for (let i = 0; i < Math.min((body.emails || []).length, 100); i++) { await sendEmail(env, { to: body.emails[i], subject: body.subject || "Update", body: body.content || "" }); sent++; } return { status: 200, body: { sent } };
}
async function biweeklyReport(body, env) {
  const emails = body.admin_emails && body.admin_emails.length ? body.admin_emails : ADMIN_EMAILS; let sent = 0;
  for (let i = 0; i < emails.length; i++) { await sendEmail(env, { to: emails[i], subject: "Biweekly Report", body: body.stats ? JSON.stringify(body.stats) : "No stats" }); sent++; } return { status: 200, body: { sent } };
}
async function moderateListing(body, env) {
  if (body.seller_email) await sendEmail(env, { to: body.seller_email, subject: "Listing " + (body.status === "active" ? "Approved" : "Rejected") + ": " + body.listing_title, body: "Your listing \"" + body.listing_title + "\" was " + (body.status === "active" ? "approved" : "rejected") + "." + (body.reason ? " Reason: " + body.reason : "") }); return { status: 200, body: { success: true } };
}
async function deleteListingPermanent(body, env) {
  if (body.seller_email && body.listing_title) await sendEmail(env, { to: body.seller_email, subject: "Listing Deleted: " + body.listing_title, body: "Your listing \"" + body.listing_title + "\" was deleted." }); return { status: 200, body: { success: true } };
}
async function createSupabaseUpload(body, env) {
  const sk = env.SUPABASE_SERVICE_ROLE_KEY; const url = env.SUPABASE_URL || "https://smymannqqogtshvsiqyp.supabase.co";
  if (!sk) return { status: 500, body: { error: "Supabase not configured" } };
  if (Number(body.size || 0) > MAX_BYTES) return { status: 400, body: { error: "Max 25MB" } };
  const path = safePath(body.folder, body.fileName); const h = { apikey: sk, Authorization: "Bearer " + sk, "Content-Type": "application/json" };
  const sr = await fetch(url + "/storage/v1/object/upload/sign/" + BUCKET + "/" + encodeURIComponent(path).replace(/%2F/g, "/"), { method: "POST", headers: h, body: JSON.stringify({ upsert: false }) }); const signed = await sr.json().catch(() => ({}));
  if (!sr.ok) return { status: sr.status, body: { error: signed.message || "Upload prep failed" } };
  return { status: 200, body: { bucket: BUCKET, path, token: signed.token, signedUrl: signed.signedURL || signed.signedUrl, publicUrl: url + "/storage/v1/object/public/" + BUCKET + "/" + path } };
}
async function uploadToR2(body, env) {
  if (!body.fileName || !body.contentType || !body.dataUrl) return { status: 400, body: { error: "Missing file data" } };
  if (!env.MEDIA) return { status: 500, body: { error: "R2 not configured" } };
  const b64 = String(body.dataUrl).indexOf(",") >= 0 ? String(body.dataUrl).split(",")[1] : String(body.dataUrl);
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0)); if (bin.byteLength > 25 * 1024 * 1024) return { status: 413, body: { error: "Max 25MB" } };
  const key = String(body.folder || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "-") + "/" + Date.now() + "-" + String(body.fileName).replace(/[^a-zA-Z0-9._-]/g, "-");
  await env.MEDIA.put(key, bin, { httpMetadata: { contentType: body.contentType } });
  const base = (env.R2_PUBLIC_URL || "").replace(/\/$/, ""); const url = base ? (base.startsWith("http") ? base : "https://" + base) + "/" + key : "/" + key;
  return { status: 200, body: { key, file_url: url } };
}
async function listMedia(_, env) {
  if (!env.MEDIA) return { status: 500, body: { error: "R2 not configured" } };
  try { const listed = await env.MEDIA.list({ limit: 200 }); return { status: 200, body: { media: listed.objects || [] } }; } catch (e) { return { status: 500, body: { error: e.message } }; }
}
