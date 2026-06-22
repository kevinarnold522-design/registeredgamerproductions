// =====================================================================
// Backend function handlers — Cloudflare port of the Base44 functions/.
// Each handler returns { status, body }. Logic is lifted from the Deno
// functions; the Base44 SDK calls become direct D1 writes (which the
// db.js layer auto-mirrors to Base44 as the backup).
//
// ALL 27 Base44 functions from MIGRATION_MANIFEST.json are ported here.
// =====================================================================
import { createRecord, updateRecord, deleteRecord, listRecords } from "./db.js";
import { getSupabaseUser } from "./supabaseAuth.js";

const MASTER_EMAIL = "kevinarnold522@gmail.com";
const ADMIN_EMAILS = ["kevinjersey2019@gmail.com", "arnoldk137@gmail.com", "kevinarnold522@gmail.com"];

export async function handleFunction(name, body, env, request) {
  switch (name) {
    case "api/hello":              return { status: 200, body: { message: "Hello from Cloudflare Worker" } };
    case "api/register":           return apiRegister(body, env);
    case "adminUpdateEntity":      return adminUpdateEntity(body, env, request);
    case "getPaypalConfig":        return getPaypalConfig(body, env);
    case "createPaypalOrder":      return createPaypalOrder(body, env, request);
    case "createSupabaseUpload":   return createSupabaseUpload(body, env, request);
    case "capturePaypalPayment":   return capturePaypalPayment(body, env, request);
    case "verifyPaymentStatus":    return verifyPaymentStatus(body, env);
    case "completePayment":        return completePayment(body, env);
    case "createTier1Order":       return createTier1Order(body, env, request);
    case "captureTier1Payment":    return captureTier1Payment(body, env, request);
    case "connectSellerPaypal":    return connectSellerPaypal(body, env, request);
    case "getSellerPaypalStatus":  return getSellerPaypalStatus(body, env, request);
    case "sendOrderNotification":  return sendOrderNotification(body, env);
    case "salesNotification":      return salesNotification(body, env);
    case "notifyNewMember":        return notifyNewMember(body, env);
    case "notifyNewContent":       return notifyNewContent(body, env);
    case "copyrightViolationAlert":return copyrightViolationAlert(body, env);
    case "sendDailyRewardEmail":   return sendDailyRewardEmail(body, env, request);
    case "sendPaypalGuideEmail":   return sendPaypalGuideEmail(body, env, request);
    case "dailyUpdatesEmail":      return dailyUpdatesEmail(body, env);
    case "biweeklyReport":         return biweeklyReport(body, env);
    case "moderateListing":        return moderateListing(body, env);
    case "deleteListingPermanent": return deleteListingPermanent(body, env, request);
    case "logLogin":               return logLogin(body, env, request);
    case "updateProfileMedia":     return updateProfileMedia(body, env, request);
    case "createManagedAccount":   return createManagedAccount(body, env, request);
    case "adminGhostAccounts":     return adminGhostAccounts(body, env, request);
    case "loginAsGhost":           return loginAsGhost(body, env, request);
    case "uploadToR2":             return uploadToR2(body, env, request);
    case "listMedia":              return listMedia(body, env, request);
    default:
      return { status: 404, body: { error: `Function '${name}' not found` } };
  }
}

// ─────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────

// Resolve the current user from the request — Supabase access token only.
async function getUser(env, request) {
  if (!request) return null;
  return getSupabaseUser(env, request);
}

function isAdmin(user) {
  if (!user) return false;
  return user.role === "admin" || String(user.email || "").toLowerCase() === MASTER_EMAIL.toLowerCase();
}

// Send an email via the Base44 Core integration (email delivery stays on Base44).
async function sendEmail(env, { to, subject, body, from_name }) {
  if (!env.BASE44_SERVICE_TOKEN || !env.BASE44_APP_ID) {
    console.error("sendEmail: BASE44 service token / app id not configured");
    return;
  }
  try {
    await fetch(`https://app.base44.com/api/apps/${env.BASE44_APP_ID}/integrations/Core/SendEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json", api_key: env.BASE44_SERVICE_TOKEN },
      body: JSON.stringify({ to, subject, body, from_name }),
    });
  } catch (err) {
    console.error("sendEmail failed:", err.message);
  }
}

async function getPayPalAccessToken(env) {
  const clientId = env.PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal auth failed: ${data.error_description || JSON.stringify(data)}`);
  return data.access_token;
}

// ─────────────────────────────────────────────────────────────────────
// PayPal
// ─────────────────────────────────────────────────────────────────────

function getPaypalConfig(_body, env) {
  return { status: 200, body: { client_id: env.PAYPAL_CLIENT_ID, currency: "USD" } };
}

async function createPaypalOrder(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const { amount, currency = "USD", items = [], description = "GAMER Productions Purchase" } = body;
  if (!amount || amount <= 0) return { status: 400, body: { error: "Invalid amount" } };

  const accessToken = await getPayPalAccessToken(env);
  const orderPayload = {
    intent: "CAPTURE",
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: parseFloat(amount).toFixed(2),
        breakdown: { item_total: { currency_code: currency, value: parseFloat(amount).toFixed(2) } },
      },
      description,
      items: items.length > 0 ? items.map((i) => ({
        name: (i.listing_title || i.name || "Item").substring(0, 127),
        unit_amount: { currency_code: currency, value: parseFloat(i.price || 0).toFixed(2) },
        quantity: String(i.quantity || 1),
      })) : [{
        name: description.substring(0, 127),
        unit_amount: { currency_code: currency, value: parseFloat(amount).toFixed(2) },
        quantity: "1",
      }],
    }],
    application_context: { brand_name: "GAMER Productions", user_action: "PAY_NOW", shipping_preference: "NO_SHIPPING" },
  };

  const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });
  const order = await res.json();
  if (!res.ok) throw new Error(`PayPal order creation failed: ${JSON.stringify(order)}`);
  return { status: 200, body: { orderId: order.id, status: order.status } };
}

async function capturePaypalPayment(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const { orderId, cartItems = [] } = body;
  if (!orderId) return { status: 400, body: { error: "Missing orderId" } };

  const accessToken = await getPayPalAccessToken(env);
  const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  const capture = await res.json();
  if (!res.ok) throw new Error(`PayPal capture failed: ${JSON.stringify(capture)}`);

  const captureStatus = capture.status;
  const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const capturedAmount = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
  if (captureStatus !== "COMPLETED") {
    return { status: 400, body: { error: `Payment not completed. Status: ${captureStatus}` } };
  }

  await createRecord(env, "Transactions", {
    customer_email: user.email,
    item_name: cartItems.map((i) => i.listing_title || i.name || "Item").join(", "),
    amount: parseFloat(capturedAmount || 0),
    payment_status: "paid",
    paypal_order_id: orderId,
  });

  for (const item of cartItems) {
    const itemPrice = parseFloat(item.price || 0);
    await createRecord(env, "Order", {
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
    if (item.id) await deleteRecord(env, "Cart", item.id);
  }

  return { status: 200, body: { success: true, captureId, orderId, status: captureStatus, amount: capturedAmount } };
}

async function verifyPaymentStatus(body, env) {
  const { orderId } = body;
  if (!orderId) return { status: 400, body: { error: "Missing orderId" } };
  const accessToken = await getPayPalAccessToken(env);
  const res = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const order = await res.json();
  if (!res.ok) throw new Error(`PayPal verify failed: ${JSON.stringify(order)}`);
  return {
    status: 200,
    body: {
      orderId: order.id,
      status: order.status,
      amount: order.purchase_units?.[0]?.amount?.value,
      currency: order.purchase_units?.[0]?.amount?.currency_code,
    },
  };
}

async function completePayment(body, env) {
  const { orderData, paypalOrderId } = body;
  const globalTransaction = await createRecord(env, "GlobalTransactions", {
    order_id: orderData.id || crypto.randomUUID(),
    buyer_email: orderData.buyer_email,
    seller_email: orderData.seller_email,
    seller_paypal_id: orderData.seller_paypal_id,
    total_amount: orderData.total_amount,
    admin_fee: orderData.admin_fee || orderData.total_amount * 0.1,
    seller_payout: orderData.seller_payout || orderData.total_amount * 0.9,
    paypal_order_id: paypalOrderId,
    payment_status: "completed",
    split_status: "split",
    transaction_date: new Date().toISOString(),
  });

  if (orderData.order_id) {
    try {
      await updateRecord(env, "Order", orderData.order_id, {
        payment_status: "paid",
        order_status: "completed",
        transaction_id: paypalOrderId,
      });
    } catch (e) {
      console.log("Order update skipped:", e.message);
    }
  }

  return { status: 200, body: { success: true, transaction_id: globalTransaction.id, message: "Transaction completed and split recorded" } };
}

async function createTier1Order(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const existing = await listRecords(env, "Tier1Subscription", { user_email: user.email, status: "active" }, 1);
  if (existing.length > 0) return { status: 400, body: { error: "Already subscribed" } };

  const accessToken = await getPayPalAccessToken(env);
  const origin = request?.headers.get("origin") || "https://app.base44.com";
  const orderPayload = {
    intent: "CAPTURE",
    purchase_units: [{
      amount: { currency_code: "USD", value: "1.00", breakdown: { item_total: { currency_code: "USD", value: "1.00" } } },
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
      return_url: `${origin}/payment?tier1=success`,
      cancel_url: `${origin}/payment?tier1=cancel`,
    },
  };

  const res = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(orderPayload),
  });
  const order = await res.json();
  if (!res.ok) throw new Error(`PayPal order creation failed: ${JSON.stringify(order)}`);

  const approvalUrl = order.links?.find((l) => l.rel === "approve")?.href;
  if (!approvalUrl) throw new Error("No approval URL from PayPal");
  return { status: 200, body: { orderId: order.id, approvalUrl } };
}

async function captureTier1Payment(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const { orderId } = body;
  if (!orderId) return { status: 400, body: { error: "Missing orderId" } };

  const accessToken = await getPayPalAccessToken(env);
  const verifyRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const orderDetails = await verifyRes.json();
  if (!verifyRes.ok) throw new Error(`Order verification failed: ${JSON.stringify(orderDetails)}`);

  const unit = orderDetails.purchase_units?.[0];
  const amount = parseFloat(unit?.amount?.value || 0);
  const currency = unit?.amount?.currency_code;
  if (amount !== 1.0 || currency !== "USD") return { status: 400, body: { error: "Invalid payment amount" } };
  if (orderDetails.status === "COMPLETED") return { status: 400, body: { error: "Order already captured" } };

  const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
  });
  const capture = await captureRes.json();
  if (!captureRes.ok) throw new Error(`Capture failed: ${JSON.stringify(capture)}`);
  if (capture.status !== "COMPLETED") return { status: 400, body: { error: `Payment not completed: ${capture.status}` } };

  const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const now = new Date();
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 1);

  await createRecord(env, "Tier1Subscription", {
    user_email: user.email,
    username: user.full_name,
    paypal_order_id: orderId,
    amount: 1,
    status: "active",
    start_date: now.toISOString(),
    expiry_date: expiry.toISOString(),
    is_verified: true,
  });

  await createRecord(env, "GlobalTransactions", {
    payer_email: user.email,
    item_name: "Tier 1 Verified Partner Subscription",
    amount: 1,
    currency: "USD",
    payment_method: "paypal",
    paypal_order_id: orderId,
    paypal_capture_id: captureId,
    status: "paid",
  });

  const expiryStr = expiry.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  await sendEmail(env, {
    to: user.email,
    subject: "🎮 Welcome to Tier 1 Verified Partner — GAMER.PRODUCTIONS",
    body: `Hi ${user.full_name},\n\nThank you for your $1 Tier 1 Verified Partner subscription!\n\n✅ Subscription Status: ACTIVE\n📅 Expires: ${expiryStr}\n🧾 PayPal Order: ${orderId}\n\n🌟 YOUR TIER 1 BENEFITS:\n✓ Post & comment in ALL Gaming Communities\n✓ Verified Partner Purple Checkmark badge\n🚫 Ad-Free Experience — All advertisements removed\n✓ Exclusive Tier 1 Group Chat access\n✓ Automatic email alerts for new listings in your joined groups\n✓ Chat any user on the platform\n✓ Request new gaming categories & subcategories\n✓ Unlock animated profile avatars & exclusive skins\n\nWelcome to the family!\n\n— Kevin & The GAMER.PRODUCTIONS Team`,
  });

  return { status: 200, body: { success: true, captureId, expiryDate: expiry.toISOString() } };
}

async function connectSellerPaypal(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const { paypalEmail, paypalMerchantId, paypalConnected } = body;
  const profile = (await listRecords(env, "UserProfile", { user_email: user.email }, 1))[0];
  if (!profile) return { status: 404, body: { error: "Profile not found" } };

  await updateRecord(env, "UserProfile", profile.id, {
    paypal_email: paypalEmail,
    paypal_merchant_id: paypalMerchantId,
    paypal_connected: paypalConnected,
    payout_method: "paypal",
  });
  return { status: 200, body: { success: true, message: "PayPal connected successfully" } };
}

async function getSellerPaypalStatus(_body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const profile = (await listRecords(env, "UserProfile", { user_email: user.email }, 1))[0];
  if (!profile) return { status: 404, body: { error: "Profile not found" } };

  if (!profile.paypal_connected || !profile.paypal_merchant_id) {
    return { status: 200, body: { connected: false, message: "PayPal not connected", connectUrl: "https://www.paypal.com/signin" } };
  }
  return {
    status: 200,
    body: {
      connected: true,
      paypal_email: profile.paypal_email,
      paypal_merchant_id: profile.paypal_merchant_id,
      payout_method: profile.payout_method,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────
// Notifications & emails
// ─────────────────────────────────────────────────────────────────────

async function sendOrderNotification(body, env) {
  const { order_id, listing_id, buyer_email, seller_email, listing_title, amount } = body;

  await createRecord(env, "Notification", {
    user_email: buyer_email,
    type: "order",
    title: "Order Confirmed!",
    message: `Your purchase of "${listing_title}" for $${Number(amount).toLocaleString()} is confirmed.`,
    link: "/dashboard?tab=orders",
    related_id: order_id,
  });

  await createRecord(env, "Notification", {
    user_email: seller_email,
    type: "sale",
    title: "New Sale! 💰",
    message: `You sold "${listing_title}" for $${Number(amount).toLocaleString()}. Payout: $${(amount * 0.9).toLocaleString()}.`,
    link: "/dashboard?tab=sales",
    related_id: order_id,
  });

  if (listing_id) {
    const rows = await listRecords(env, "Listing", { id: listing_id }, 1);
    if (rows[0]) await updateRecord(env, "Listing", listing_id, { views: (rows[0].views || 0) + 1 });
  }
  return { status: 200, body: { success: true } };
}

async function salesNotification(body, env) {
  const { buyer_email, seller_email, listing_title, amount, commission, seller_payout, order_id } = body;

  await sendEmail(env, {
    to: buyer_email,
    subject: "✅ Purchase Successful — GAMER Productions",
    body: `Hey Gamer!\n\nYour purchase was successful! 🎮\n\nItem: ${listing_title}\nAmount Paid: $${amount?.toLocaleString()}\nOrder ID: ${order_id || "N/A"}\n\nYour download link or details will be delivered by the seller shortly.\n\nThank you for shopping on GAMER Productions!\n\n— GAMER Productions Team 🕹️`,
  });

  if (seller_email) {
    await sendEmail(env, {
      to: seller_email,
      subject: "💰 You Made a Sale! — GAMER Productions",
      body: `Congratulations! 🎉\n\nYou just made a sale on GAMER Productions!\n\nItem Sold: ${listing_title}\nSale Amount: $${amount?.toLocaleString()}\nPlatform Commission (10%): $${commission?.toLocaleString()}\nYour Payout: $${seller_payout?.toLocaleString()}\n\nPayout will be processed to your PayPal within 1-3 business days.\n\nKeep it up — GAMER Productions Team 🕹️`,
    });
  }

  await sendEmail(env, {
    to: "admin@gamerproductions.com",
    subject: "📊 New Sale Alert — GAMER Productions",
    body: `New Sale Recorded!\n\nItem: ${listing_title}\nBuyer: ${buyer_email}\nSeller: ${seller_email}\nTotal Amount: $${amount?.toLocaleString()}\nPlatform Commission (10%): $${commission?.toLocaleString()}\nSeller Payout: $${seller_payout?.toLocaleString()}\nOrder ID: ${order_id || "N/A"}\n\n— GAMER Productions Admin`,
  });

  return { status: 200, body: { success: true } };
}

async function notifyNewMember(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const { franchise_id, franchise_name, new_member_email, new_member_username } = body;
  if (!franchise_id || !franchise_name || !new_member_email) {
    return { status: 400, body: { error: "Missing required fields" } };
  }

  const members = await listRecords(env, "CommunityMember", { franchise_id }, 1000);
  const memberEmails = members.map((m) => m.user_email).filter((e) => e && e !== new_member_email);
  if (memberEmails.length === 0) return { status: 200, body: { success: true, notified: 0 } };

  let notified = 0;
  for (const email of memberEmails) {
    await sendEmail(env, {
      to: email,
      subject: `New Member Joined ${franchise_name}! 🎮`,
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #7c3aed;">🎮 New Community Member!</h2><p><strong>${new_member_username || new_member_email}</strong> has just joined the <strong>${franchise_name}</strong> community!</p><p>Welcome them and start engaging in the community.</p></div>`,
    });
    notified++;
  }
  return { status: 200, body: { success: true, notified, total: memberEmails.length } };
}

async function notifyNewContent(body, env) {
  let franchise_id, title, type, url;
  if (body.event) {
    const listing = body.data;
    franchise_id = listing?.community_franchise_id;
    title = listing?.title;
    type = "listing";
    url = `https://gamer.productions/listing?id=${listing?.id}`;
  } else {
    franchise_id = body.franchise_id;
    title = body.title;
    type = body.type || "post";
    url = body.url;
  }

  if (!franchise_id || !title) return { status: 200, body: { sent: 0, message: "Missing data" } };

  const members = await listRecords(env, "CommunityMember", { franchise_id }, 1000);
  if (members.length === 0) return { status: 200, body: { sent: 0, message: "No members" } };

  const subject = type === "listing" ? `🎮 New listing in your community: ${title}` : `📢 New post in your community: ${title}`;
  const htmlBody = `<div style="font-family:sans-serif;background:#050510;color:#fff;padding:32px;border-radius:16px;max-width:600px;margin:auto;"><h2 style="color:#a78bfa;margin-bottom:8px;">🎮 Gamer.Productions</h2><h3 style="color:#fff;font-size:20px;margin-bottom:12px;">${subject}</h3><p style="color:#9ca3af;margin-bottom:20px;">There's new content in a community you follow.</p><div style="background:#111827;border:1px solid #374151;border-radius:12px;padding:16px;margin-bottom:20px;"><p style="color:#fff;font-weight:bold;margin:0 0 8px;">${title}</p></div>${url ? `<a href="${url}" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;">View Now →</a>` : ""}</div>`;

  const emails = [...new Set(members.map((m) => m.user_email).filter(Boolean))];
  let sent = 0;
  for (const email of emails.slice(0, 50)) {
    await sendEmail(env, { to: email, subject, body: htmlBody });
    sent++;
  }
  return { status: 200, body: { sent, message: `Notified ${sent} members` } };
}

async function copyrightViolationAlert(body, env) {
  const { creator_email, creator_username, video_title, risk_level, issues, video_url } = body;
  const issuesList = (issues || []).map((i, idx) => `${idx + 1}. ${i}`).join("\n");

  await sendEmail(env, {
    to: creator_email,
    subject: `⚠️ Copyright Alert: "${video_title}" — Action Required`,
    body: `Hi ${creator_username},\n\nYour recently uploaded video has been flagged by our AI copyright scanner.\n\n📹 Video: ${video_title}\n⚠️ Risk Level: ${risk_level}\n\nPotential Issues Detected:\n${issuesList || "No specific issues listed."}\n\nWhat to do:\n1. Review the flagged content before publishing\n2. Replace any copyrighted music with royalty-free alternatives\n3. Remove or replace third-party clips you don't have rights to\n\nStay safe and keep creating!\nGAMER Productions Team`,
  });

  const adminUsers = await listRecords(env, "User", { role: "admin" }, 100);
  for (const adminUser of adminUsers) {
    await createRecord(env, "Notification", {
      user_email: adminUser.email,
      type: "system",
      title: `⚠️ Copyright Alert: ${video_title}`,
      message: `Video by ${creator_username} flagged at ${risk_level} risk. Review in Videos tab.`,
      is_read: false,
      link: "/dashboard?tab=videos",
    });
    await sendEmail(env, {
      to: adminUser.email,
      subject: "🚨 Copyright Violation Alert — Admin Review Required",
      body: `A video has been flagged for potential copyright violations.\n\n📹 Video Title: ${video_title}\n👤 Creator: ${creator_username} (${creator_email})\n⚠️ Risk Level: ${risk_level}\n\nIssues Detected:\n${issuesList || "General copyright risk detected."}\n${video_url ? `\n📎 Video URL: ${video_url}` : ""}\n\nLogin to Admin Dashboard → Videos tab to manage this content.`,
    });
  }
  return { status: 200, body: { success: true, message: "Copyright alerts sent." } };
}

async function sendDailyRewardEmail(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const { streak = 0, nextReward = "Daily Login Bonus", userEmail, username } = body;
  const daysToGo = Math.max(0, 365 - streak);
  const progressPct = Math.min(100, Math.round((streak / 365) * 100));

  const emailHtml = `<div style="background:#050510;font-family:'Segoe UI',Arial,sans-serif;padding:0;"><div style="max-width:600px;margin:0 auto;background:#0d0d1a;border-radius:20px;overflow:hidden;"><div style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:40px 30px;text-align:center;"><span style="font-size:64px;display:block;margin-bottom:16px;">🎁</span><h1 style="color:#fff;font-size:28px;font-weight:900;margin:0 0 8px;">Your Daily Reward Awaits!</h1><p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">Hey ${username || "Gamer"} — log in now to claim your reward and keep your streak alive! 🔥</p></div><div style="padding:32px 30px;"><div style="background:linear-gradient(135deg,#1a0a2e,#0a1a2e);border:2px solid #7c3aed44;border-radius:16px;padding:20px;margin-bottom:24px;text-align:center;"><div style="font-size:52px;font-weight:900;color:#f59e0b;line-height:1;">🔥 ${streak}</div><div style="color:#9ca3af;font-size:13px;margin-top:4px;">Day Streak</div><div style="background:#1a1a2e;border-radius:999px;height:10px;margin:16px 0 8px;overflow:hidden;"><div style="background:linear-gradient(90deg,#7c3aed,#ec4899,#f59e0b);height:100%;border-radius:999px;width:${progressPct}%"></div></div><div style="color:#6b7280;font-size:12px;">${streak}/365 days to the $10 USD Grand Prize (${daysToGo} days to go!)</div></div><div style="background:#0a0a1a;border:2px solid #7c3aed33;border-radius:16px;padding:20px;margin-bottom:24px;"><div style="color:#a78bfa;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Today's Reward</div><div style="color:#fff;font-size:18px;font-weight:900;">${nextReward}</div></div><a href="https://gamerproductions.vercel.app" style="display:block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;padding:18px 32px;border-radius:16px;font-size:18px;font-weight:900;text-align:center;margin:24px 0;">🎮 Claim My Daily Reward Now →</a></div></div></div>`;

  await sendEmail(env, {
    to: userEmail || user.email,
    subject: `🎁 ${username || "Gamer"}, your Day ${streak + 1} reward is waiting! 🔥 ${streak} day streak`,
    body: emailHtml,
    from_name: "GAMER.Productions Rewards",
  });
  return { status: 200, body: { success: true } };
}

async function sendPaypalGuideEmail(_body, env, request) {
  const user = await getUser(env, request);
  if (!isAdmin(user)) return { status: 403, body: { error: "Forbidden: Admin only" } };

  const profiles = await listRecords(env, "UserProfile", {}, 5000);
  const htmlBody = (username) => `<div style="background:#030712;font-family:'Segoe UI',Arial,sans-serif;padding:30px 16px;"><div style="max-width:600px;margin:0 auto;background:#111827;border-radius:20px;overflow:hidden;"><div style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:40px 32px;text-align:center;"><div style="font-size:48px;margin-bottom:10px;">💳</div><h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 6px;">How to Link PayPal &amp; Banking</h1><p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;">Your step-by-step guide to receiving payments</p></div><div style="padding:28px 32px;"><h2 style="color:#f9a8d4;font-size:18px;font-weight:800;margin:0 0 8px;">Hey ${username}! 👋</h2><p style="color:#d1d5db;font-size:14px;line-height:1.8;">Connect your payment accounts and start receiving payouts on GAMER Productions. Go to Dashboard → Payment Methods, enter your PayPal email, and save.</p><a href="https://gamerproductions.base44.app/dashboard?tab=payment" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-size:15px;font-weight:800;padding:14px 40px;border-radius:12px;text-decoration:none;margin-top:16px;">💳 Set Up My Payment Now →</a></div></div></div>`;

  let sent = 0;
  let failed = 0;
  for (const p of profiles) {
    if (!p.user_email) continue;
    const name = p.username || p.display_name || "Gamer";
    try {
      await sendEmail(env, { to: p.user_email, subject: "💳 How to Link PayPal & Banking on GAMER Productions", body: htmlBody(name) });
      sent++;
    } catch (e) {
      console.error(`Failed for ${p.user_email}: ${e.message}`);
      failed++;
    }
  }
  return { status: 200, body: { sent, failed, total: profiles.length } };
}

async function dailyUpdatesEmail(body, env) {
  const dryRun = body?.dry_run === true;
  const [users, listings, posts] = await Promise.all([
    listRecords(env, "User", {}, 1000),
    listRecords(env, "Listing", { status: "active" }, 5),
    listRecords(env, "CommunityPost", { status: "active" }, 5),
  ]);

  const recipients = users.filter((u) => u?.email).map((u) => ({ email: u.email, name: u.full_name || "Gamer" }));
  const listingItems = listings.map((item) => `<li><strong>${item.title || "New listing"}</strong>${item.price ? ` — $${Number(item.price).toLocaleString()}` : " — FREE"}</li>`).join("");
  const postItems = posts.map((item) => `<li>${String(item.content || "").slice(0, 120)}</li>`).join("");

  const bodyHtml = (name) => `<div style="background:#050510;color:#f8fafc;font-family:Arial,sans-serif;padding:24px"><div style="max-width:640px;margin:0 auto;background:#111827;border:1px solid #312e81;border-radius:18px;padding:24px"><h1 style="margin:0 0 8px;color:#c4b5fd">Daily GAMER.Productions Update</h1><p style="color:#d1d5db">Hi ${name}, here are today's latest community updates.</p><h2 style="font-size:16px;color:#93c5fd;margin-top:22px">Latest listings</h2><ul style="color:#e5e7eb;line-height:1.7">${listingItems || "<li>No new active listings today.</li>"}</ul><h2 style="font-size:16px;color:#93c5fd;margin-top:22px">Latest community posts</h2><ul style="color:#e5e7eb;line-height:1.7">${postItems || "<li>No new active community posts today.</li>"}</ul><a href="https://gamerproductions.vercel.app" style="display:inline-block;margin-top:18px;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700">Open GAMER.Productions</a></div></div>`;

  if (dryRun) {
    return { status: 200, body: { success: true, dry_run: true, recipients: recipients.length, listings: listings.length, posts: posts.length } };
  }

  let sent = 0;
  let failed = 0;
  for (const recipient of recipients) {
    try {
      await sendEmail(env, { to: recipient.email, subject: "Your daily GAMER.Productions update", body: bodyHtml(recipient.name), from_name: "GAMER.Productions Updates" });
      sent++;
    } catch {
      failed++;
    }
  }
  return { status: 200, body: { success: true, recipients: recipients.length, sent, failed } };
}

async function biweeklyReport(_body, env) {
  const [profiles, listings, orders, videos] = await Promise.all([
    listRecords(env, "UserProfile", {}, 5000),
    listRecords(env, "Listing", {}, 5000),
    listRecords(env, "Order", {}, 5000),
    listRecords(env, "VideoPost", {}, 5000),
  ]);

  const paidOrders = orders.filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.amount || 0), 0);
  const totalCommission = paidOrders.reduce((s, o) => s + (o.commission || 0), 0);
  const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);

  const creators = profiles.filter((p) => p.account_type === "digital_creator");
  const businesses = profiles.filter((p) => p.account_type === "business");
  const regular = profiles.filter((p) => p.account_type === "regular");

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - 14 * 24 * 60 * 60 * 1000);
  const period = `${periodStart.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} – ${periodEnd.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`;

  const htmlReport = `<div style="background:#030712;font-family:'Segoe UI',Arial,sans-serif;padding:30px 16px;"><div style="max-width:640px;margin:0 auto;background:#111827;border-radius:20px;overflow:hidden;"><div style="background:linear-gradient(135deg,#1e1b4b,#4c1d95,#7c3aed,#ec4899);padding:40px 32px;text-align:center;"><div style="font-size:42px;margin-bottom:8px;">🕹️</div><h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 6px;">Bi-Weekly Platform Report</h1><p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">Report Period: ${period}</p></div><div style="padding:28px 32px;color:#d1d5db;font-size:14px;line-height:1.9;"><p>👥 Total Users: <strong style="color:#a78bfa">${profiles.length}</strong> (${regular.length} gamers, ${creators.length} creators, ${businesses.length} businesses)</p><p>💰 Total Revenue: <strong style="color:#4ade80">$${totalRevenue.toLocaleString()}</strong></p><p>🏆 Commission Earned: <strong style="color:#fbbf24">$${totalCommission.toLocaleString()}</strong></p><p>🛒 Listings: <strong>${listings.length}</strong> · Orders: <strong>${orders.length}</strong> (${paidOrders.length} paid)</p><p>🎬 Total Video Views: <strong style="color:#60a5fa">${totalViews.toLocaleString()}</strong></p></div></div></div>`;

  for (const adminEmail of ADMIN_EMAILS) {
    await sendEmail(env, { to: adminEmail, subject: `📊 GAMER Productions · Bi-Weekly Report · ${period}`, body: htmlReport });
  }
  return {
    status: 200,
    body: {
      success: true,
      message: `Bi-weekly report sent to ${ADMIN_EMAILS.length} admin(s)`,
      period,
      stats: { users: profiles.length, revenue: totalRevenue, commission: totalCommission, orders: orders.length, views: totalViews },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────
// Listings / moderation
// ─────────────────────────────────────────────────────────────────────

async function moderateListing(body, env) {
  const { listing_id, action } = body;
  const status = action === "approve" ? "active" : "removed";
  await updateRecord(env, "Listing", listing_id, { status, is_approved: action === "approve" });
  return { status: 200, body: { success: true, status } };
}

async function deleteSupabaseRows(env, entityName, query = {}) {
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  try {
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await supabase.from(entityName).delete().match(query);
    if (error) {
      console.error("Supabase cleanup failed", entityName, error.message);
    }
  } catch (e) {
    console.error("Supabase cleanup error", entityName, e.message);
  }
}

async function deleteListingPermanent(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const { listing_id } = body;
  if (!listing_id) return { status: 400, body: { error: "Missing listing id" } };

  const listing = (await listRecords(env, "Listing", { id: listing_id }, 1))[0];
  if (!listing) return { status: 404, body: { error: "Listing not found" } };

  const owner =
    String(listing.seller_email || "").toLowerCase() === String(user.email || "").toLowerCase() ||
    String(listing.created_by || "").toLowerCase() === String(user.email || "").toLowerCase() ||
    String(listing.created_by_id || "") === String(user.id || "") ||
    String(listing.created_by_id || "") === String(user.email || "");
  if (!isAdmin(user) && !owner) return { status: 403, body: { error: "Forbidden" } };

  // Delete media from the Worker's R2 bucket binding
  let deletedFiles = 0;
  const urls = new Set();
  const collect = (v) => {
    if (!v) return;
    if (typeof v === "string" && (v.startsWith("http://") || v.startsWith("https://"))) urls.add(v);
    else if (Array.isArray(v)) v.forEach(collect);
    else if (typeof v === "object") Object.values(v).forEach(collect);
  };
  collect(listing.images); collect(listing.download_url); collect(listing.video_url); collect(listing.preview_video_url);

  if (env.MEDIA) {
    const publicBase = (env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/$/, "");
    for (const u of urls) {
      try {
        const key = publicBase && u.startsWith(publicBase + "/") ? decodeURIComponent(u.slice(publicBase.length + 1)) : new URL(u).pathname.replace(/^\//, "");
        if (key) { await env.MEDIA.delete(key); deletedFiles++; }
      } catch (e) { console.error("R2 delete failed", e.message); }
    }
  }

  // Cascade delete related records
  const related = [
    ["Favorite", { listing_id }], ["PostComment", { post_id: listing_id }], ["PostRating", { post_id: listing_id }],
    ["PostLike", { post_id: listing_id }], ["PostComment", { listing_id }], ["ChannelPostComment", { post_id: listing_id }],
    ["Review", { listing_id }], ["ListingDeleteRequest", { listing_id }], ["ListingPageLayout", { listing_id }],
    ["Cart", { listing_id }], ["Order", { listing_id }], ["Notification", { related_id: listing_id }], ["CommunityPost", { listing_id }],
  ];
  for (const [entityName, query] of related) {
    try {
      const rows = await listRecords(env, entityName, query, 1000);
      for (const row of rows) await deleteRecord(env, entityName, row.id);
      await deleteSupabaseRows(env, entityName, query);
    } catch (e) { console.error("Related cleanup failed", entityName, e.message); }
  }

  await deleteRecord(env, "Listing", listing_id);
  await deleteSupabaseRows(env, "Listing", { id: listing_id });
  return { status: 200, body: { success: true, deletedFiles } };
}

// ─────────────────────────────────────────────────────────────────────
// Users / profiles / admin
// ─────────────────────────────────────────────────────────────────────

async function logLogin(_body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const userAgent = request?.headers.get("user-agent") || "";
  let deviceType = "desktop";
  if (/mobile/i.test(userAgent)) deviceType = "mobile";
  else if (/tablet/i.test(userAgent)) deviceType = "tablet";

  let browser = "Unknown";
  if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/chrome/i.test(userAgent)) browser = "Chrome";
  else if (/firefox/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent)) browser = "Safari";

  const ip = request?.headers.get("x-forwarded-for")?.split(",")[0] || request?.headers.get("cf-connecting-ip") || "unknown";

  await createRecord(env, "LoginHistory", {
    user_email: user.email,
    login_date: new Date().toISOString(),
    ip_address: ip,
    device_type: deviceType,
    browser,
    location: "Philippines",
    success: true,
  });
  return { status: 200, body: { success: true } };
}

async function updateProfileMedia(body, env, request) {
  const ALLOWED_FIELDS = ["avatar_url", "avatar_urls", "banner_url", "profile_theme_color"];
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const { profile_id, field, value } = body;
  const updates = body.updates || (field ? { [field]: value } : null);
  if (!profile_id || !updates || typeof updates !== "object") return { status: 400, body: { error: "Invalid profile media update" } };

  const safeUpdates = {};
  for (const [key, val] of Object.entries(updates)) {
    if (ALLOWED_FIELDS.includes(key)) safeUpdates[key] = val;
  }
  if (Object.keys(safeUpdates).length === 0) return { status: 400, body: { error: "No allowed profile media fields" } };

  const profile = (await listRecords(env, "UserProfile", { id: profile_id }, 1))[0];
  if (!profile) return { status: 404, body: { error: "Profile not found" } };

  const owner = String(profile.user_email || "").toLowerCase() === String(user.email || "").toLowerCase();
  if (!isAdmin(user) && !owner) return { status: 403, body: { error: "Forbidden" } };

  const updated = await updateRecord(env, "UserProfile", profile_id, safeUpdates);
  return { status: 200, body: { success: true, profile: updated } };
}

async function createManagedAccount(body, env, request) {
  const user = await getUser(env, request);
  if (!user || user.role !== "admin") return { status: 403, body: { error: "Forbidden: Admin access required" } };

  const { action, email, username, avatar_url, display_name, account_type, target_email } = body;

  if (action === "list") {
    const managed = await listRecords(env, "UserProfile", { is_managed_account: true }, 1000);
    const accountsWithStats = await Promise.all(managed.map(async (account) => {
      const [listings, posts, follows] = await Promise.all([
        listRecords(env, "Listing", { seller_email: account.user_email }, 1000),
        listRecords(env, "CommunityPost", { author_email: account.user_email }, 1000),
        listRecords(env, "Follow", { follower_email: account.user_email }, 1000),
      ]);
      return { ...account, stats: { listings: listings.length, posts: posts.length, following: follows.length } };
    }));
    return { status: 200, body: { success: true, accounts: accountsWithStats } };
  }

  if (action === "create") {
    if (!email || !username) return { status: 400, body: { error: "Email and username are required" } };
    const existing = await listRecords(env, "UserProfile", { user_email: email }, 1);
    if (existing.length > 0) return { status: 400, body: { error: "Email already registered" } };

    const profile = await createRecord(env, "UserProfile", {
      user_email: email,
      username,
      display_name: display_name || username,
      account_type: account_type || "regular",
      avatar_url: avatar_url || "",
      is_managed_account: true,
      managed_by_admin: user.email,
    });
    return { status: 200, body: { success: true, message: "Managed account created successfully", profile } };
  }

  if (action === "impersonate") {
    if (!target_email) return { status: 400, body: { error: "Target email required" } };
    const target = await listRecords(env, "UserProfile", { user_email: target_email, is_managed_account: true }, 1);
    if (target.length === 0) return { status: 404, body: { error: "Account not found or not a managed account" } };
    return {
      status: 200,
      body: { success: true, target_email, username: target[0].username, display_name: target[0].display_name, avatar_url: target[0].avatar_url },
    };
  }

  return { status: 400, body: { error: "Invalid action" } };
}

async function adminGhostAccounts(body, env, request) {
  const user = await getUser(env, request);
  if (!user || user.role !== "admin") return { status: 403, body: { error: "Admin access required" } };

  const { action, ghostData, targetEmail } = body;

  if (action === "list_ghosts") {
    const all = await listRecords(env, "UserProfile", {}, 5000);
    const ghosts = all.filter((p) => String(p.user_email || "").includes("@ghost.gamerproductions.com"));
    return { status: 200, body: { ghosts } };
  }

  if (action === "create_ghost") {
    if (!ghostData || !ghostData.username) return { status: 400, body: { error: "Username required" } };
    const email = ghostData.email || `${ghostData.username.toLowerCase().replace(/\s+/g, "_")}@ghost.gamerproductions.com`;
    const profile = await createRecord(env, "UserProfile", {
      user_email: email,
      username: ghostData.username,
      display_name: ghostData.display_name || ghostData.username,
      account_type: ghostData.account_type || "regular",
      bio: ghostData.bio || "Ghost account for testing",
      is_active: true,
    });
    return { status: 200, body: { success: true, profile, message: "Ghost account created." } };
  }

  if (action === "impersonate") {
    if (!targetEmail) return { status: 400, body: { error: "Target email required" } };
    return { status: 200, body: { success: true, message: `Viewing as ${targetEmail}`, viewUrl: `/profile?email=${encodeURIComponent(targetEmail)}` } };
  }

  if (action === "delete_ghost") {
    if (!targetEmail) return { status: 400, body: { error: "Target email required" } };
    const profiles = await listRecords(env, "UserProfile", { user_email: targetEmail }, 1);
    if (profiles.length > 0) await deleteRecord(env, "UserProfile", profiles[0].id);
    return { status: 200, body: { success: true, message: "Ghost account deleted" } };
  }

  return { status: 400, body: { error: "Invalid action" } };
}

async function loginAsGhost(body, env, request) {
  const user = await getUser(env, request);
  if (!user || user.role !== "admin") return { status: 403, body: { error: "Forbidden: Admin access required" } };

  const { target_email } = body;
  if (!target_email) return { status: 400, body: { error: "Target email required" } };

  const target = await listRecords(env, "UserProfile", { user_email: target_email, is_managed_account: true }, 1);
  if (target.length === 0) return { status: 404, body: { error: "Account not found or not a managed account" } };

  return {
    status: 200,
    body: {
      success: true,
      target_email,
      username: target[0].username,
      display_name: target[0].display_name || target[0].username,
      avatar_url: target[0].avatar_url || "",
      account_type: target[0].account_type || "regular",
      redirect_url: `/profile?email=${encodeURIComponent(target_email)}&ghost_session=1`,
    },
  };
}

// Admin-gated entity create/update (matches the standalone Base44 fn).
async function adminUpdateEntity(body, env, request) {
  const ALLOWED_ENTITIES = ["Listing", "CommunityPost", "UserProfile", "GamingCommunity"];
  const ALLOWED_ACTIONS = ["update", "create"];

  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };
  if (!isAdmin(user)) return { status: 403, body: { error: "Forbidden" } };

  const { entity, action = "update", id, data } = body;
  if (!ALLOWED_ENTITIES.includes(entity) || !ALLOWED_ACTIONS.includes(action) || !data) {
    return { status: 400, body: { error: "Invalid request" } };
  }

  let result;
  if (action === "create") {
    result = await createRecord(env, entity, data);
  } else {
    if (!id) return { status: 400, body: { error: "Missing id" } };
    result = await updateRecord(env, entity, id, data);
  }
  return { status: 200, body: { success: true, result } };
}

// Email + password sign-up straight into D1 (Pages-style register route).
async function apiRegister(body, env) {
  const { email, password, full_name } = body;
  if (!email || !password) return { status: 400, body: { error: "Missing fields" } };

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return { status: 409, body: { error: "Email already registered" } };

  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  const passwordHash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");

  const userId = crypto.randomUUID().replace(/-/g, "");
  const now = new Date().toISOString();
  await env.DB.prepare(
    "INSERT INTO users (id, email, full_name, password_hash, role, auth_provider, created_date, updated_date) VALUES (?, ?, ?, ?, 'user', 'email', ?, ?)"
  ).bind(userId, email, full_name || email.split("@")[0], passwordHash, now, now).run();

  return { status: 200, body: { success: true, user: { id: userId, email } } };
}

// ─────────────────────────────────────────────────────────────────────
// Supabase Storage upload — returns signed upload tokens for browser uploads
// ─────────────────────────────────────────────────────────────────────

const SUPABASE_MEDIA_BUCKET = "gamerproductionsmedia";
const SUPABASE_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function safeSupabasePath(folder, fileName) {
  const originalName = String(fileName || "upload").replace(/[^a-zA-Z0-9._-]/g, "-");
  const extension = originalName.includes(".") ? originalName.split(".").pop() : "bin";
  const safeFolder = String(folder || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "-");
  return `${safeFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${String(extension || "bin").toLowerCase()}`;
}

async function createSupabaseUpload(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Please sign in before uploading." } };

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "https://smymannqqogtshvsiqyp.supabase.co";
  if (!serviceKey) return { status: 500, body: { error: "Supabase upload service is not configured." } };

  const size = Number(body.size || 0);
  if (size > SUPABASE_MAX_UPLOAD_BYTES) return { status: 400, body: { error: "File is too large. Maximum size is 25MB." } };

  const path = safeSupabasePath(body.folder, body.fileName);
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };

  const signedRes = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${SUPABASE_MEDIA_BUCKET}/${encodeURIComponent(path).replace(/%2F/g, "/")}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ upsert: false }),
  });
  const signed = await signedRes.json().catch(() => ({}));
  if (!signedRes.ok) {
    console.error("Supabase signed upload failed", signed);
    return { status: signedRes.status, body: { error: signed?.message || signed?.error || "Could not prepare Supabase upload." } };
  }

  return {
    status: 200,
    body: {
      bucket: SUPABASE_MEDIA_BUCKET,
      path,
      token: signed.token,
      signedUrl: signed.signedURL || signed.signedUrl,
      publicUrl: `${supabaseUrl}/storage/v1/object/public/${SUPABASE_MEDIA_BUCKET}/${path}`,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────
// R2 upload — uses the Worker's native MEDIA bucket binding
// ─────────────────────────────────────────────────────────────────────

async function uploadToR2(body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };

  const { fileName, contentType, dataUrl, folder = "uploads" } = body;
  if (!fileName || !contentType || !dataUrl) return { status: 400, body: { error: "Missing file data" } };
  if (!env.MEDIA) return { status: 500, body: { error: "R2 MEDIA bucket binding not configured" } };

  const base64 = String(dataUrl).includes(",") ? String(dataUrl).split(",")[1] : String(dataUrl);
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  if (binary.byteLength > 25 * 1024 * 1024) return { status: 413, body: { error: "File upload limit is 25MB" } };

  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "-");
  const safeFolder = String(folder).replace(/[^a-zA-Z0-9/_-]/g, "-");
  const key = `${safeFolder}/${user.id || user.email}/${Date.now()}-${safeName}`;

  await env.MEDIA.put(key, binary, { httpMetadata: { contentType } });

  const publicBase = (env.CLOUDFLARE_R2_PUBLIC_URL || "").replace(/\/$/, "");
  const fileUrl = publicBase
    ? `${publicBase.startsWith("http") ? publicBase : "https://" + publicBase}/${key}`
    : `/${key}`;

  // Record file metadata in D1 alongside the R2 upload
  try {
    await env.DB.prepare(
      "INSERT INTO media (id, r2_key, filename, content_type, size_bytes, file_url, folder, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      crypto.randomUUID().replace(/-/g, ""),
      key, safeName, contentType, binary.byteLength, fileUrl, safeFolder,
      user.email || user.id, new Date().toISOString()
    ).run();
  } catch (e) {
    console.error("media metadata insert failed:", e.message);
  }

  return { status: 200, body: { key, file_url: fileUrl } };
}

// List uploaded media metadata from D1 (admins see all, users see their own)
async function listMedia(_body, env, request) {
  const user = await getUser(env, request);
  if (!user) return { status: 401, body: { error: "Unauthorized" } };
  try {
    const stmt = isAdmin(user)
      ? env.DB.prepare("SELECT * FROM media ORDER BY uploaded_at DESC LIMIT 200")
      : env.DB.prepare("SELECT * FROM media WHERE uploaded_by = ? ORDER BY uploaded_at DESC LIMIT 200").bind(user.email || user.id);
    const { results } = await stmt.all();
    return { status: 200, body: { media: results || [] } };
  } catch (e) {
    console.error("listMedia failed:", e.message);
    return { status: 500, body: { error: e.message } };
  }
}