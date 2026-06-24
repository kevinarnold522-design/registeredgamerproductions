import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { requireAdminUser } from '../_shared/adminAuth.ts';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const user = await requireAdminUser(req, body.accessToken);

  if (!user) {
    return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
  }

  const profiles = await base44.asServiceRole.entities.UserProfile.list();

  const htmlBody = (username) => `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030712;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:30px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111827;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(124,58,237,0.3);">

        <!-- HERO BANNER -->
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:40px 32px;text-align:center;">
          <div style="font-size:48px;line-height:1;margin-bottom:10px;">💳</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">GAMER PRODUCTIONS</div>
          <h1 style="color:#ffffff;font-size:24px;font-weight:900;margin:0 0 6px;">How to Link PayPal &amp; Banking</h1>
          <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;">Your step-by-step guide to receiving payments</p>
        </td></tr>

        <!-- GREETING -->
        <tr><td style="padding:28px 32px 0;">
          <h2 style="color:#f9a8d4;font-size:18px;font-weight:800;margin:0 0 8px;">Hey ${username}! 👋</h2>
          <p style="color:#d1d5db;font-size:14px;line-height:1.8;margin:0 0 6px;">
            We've made it easy for you to connect your payment accounts and start receiving payouts on <strong style="color:#a78bfa;">GAMER Productions</strong>. Follow the steps below to get set up!
          </p>
        </td></tr>

        <!-- STEP 1: PAYPAL -->
        <tr><td style="padding:20px 32px 0;">
          <div style="background:#1e3a5f;border-radius:14px;padding:22px 24px;border-left:4px solid #3b82f6;">
            <div style="color:#60a5fa;font-size:13px;font-weight:800;letter-spacing:1px;margin-bottom:12px;">STEP 1 — LINK YOUR PAYPAL 🅿️</div>
            <ol style="color:#d1d5db;font-size:13px;line-height:2.2;margin:0;padding-left:18px;">
              <li>Go to your <strong style="color:#93c5fd;">Dashboard</strong> → click your profile icon (top right)</li>
              <li>Select <strong style="color:#93c5fd;">"Payment Methods"</strong> from the menu</li>
              <li>Enter your <strong style="color:#93c5fd;">PayPal email address</strong> in the box shown</li>
              <li>Click <strong style="color:#93c5fd;">"Save PayPal Email"</strong> — you'll see ✅ Saved!</li>
              <li>Don't have PayPal? Click <strong style="color:#93c5fd;">"Open PayPal →"</strong> to create a free account</li>
            </ol>
            <a href="https://www.paypal.com/signin" style="display:inline-block;background:#0070ba;color:#fff;font-size:12px;font-weight:700;padding:10px 22px;border-radius:8px;text-decoration:none;margin-top:14px;">Create / Open PayPal →</a>
          </div>
        </td></tr>

        <!-- STEP 2: WISE / PAYONEER -->
        <tr><td style="padding:16px 32px 0;">
          <div style="background:#052e16;border-radius:14px;padding:22px 24px;border-left:4px solid #4ade80;">
            <div style="color:#4ade80;font-size:13px;font-weight:800;letter-spacing:1px;margin-bottom:12px;">STEP 2 — INTERNATIONAL BANK TRANSFERS 🌍</div>
            <p style="color:#d1d5db;font-size:13px;line-height:1.8;margin:0 0 10px;">Want to receive directly to your local bank (BDO, BPI, GCash, Maya)? Use <strong style="color:#4ade80;">Wise</strong> or <strong style="color:#4ade80;">Payoneer</strong> as a bridge:</p>
            <ol style="color:#d1d5db;font-size:13px;line-height:2.2;margin:0;padding-left:18px;">
              <li>Sign up for a free <strong style="color:#86efac;">Wise</strong> or <strong style="color:#86efac;">Payoneer</strong> account</li>
              <li>Add your local bank details (GCash / BDO / BPI / Maya) inside Wise or Payoneer</li>
              <li>Use your Wise/Payoneer account email as your payout method in GAMER Productions</li>
              <li>Payouts from GAMER will land in Wise/Payoneer → then withdraw to your local bank anytime</li>
            </ol>
            <div style="display:flex;gap:10px;margin-top:14px;">
              <a href="https://wise.com/invite" style="display:inline-block;background:#9fcd2b;color:#0a2a00;font-size:12px;font-weight:700;padding:10px 18px;border-radius:8px;text-decoration:none;margin-right:8px;">Open Wise →</a>
              <a href="https://www.payoneer.com/" style="display:inline-block;background:#ff4800;color:#fff;font-size:12px;font-weight:700;padding:10px 18px;border-radius:8px;text-decoration:none;">Open Payoneer →</a>
            </div>
          </div>
        </td></tr>

        <!-- STEP 3: LOCAL PH BANKS -->
        <tr><td style="padding:16px 32px 0;">
          <div style="background:#1c1f2e;border-radius:14px;padding:22px 24px;border-left:4px solid #a78bfa;">
            <div style="color:#a78bfa;font-size:13px;font-weight:800;letter-spacing:1px;margin-bottom:12px;">STEP 3 — LOCAL PH BANKING TIPS 🇵🇭</div>
            <ul style="color:#d1d5db;font-size:13px;line-height:2.2;margin:0;padding-left:18px;">
              <li><strong style="color:#c4b5fd;">GCash:</strong> Link your GCash number to Wise. Withdraw in seconds.</li>
              <li><strong style="color:#c4b5fd;">Maya (PayMaya):</strong> Link Maya card inside Wise for direct deposits.</li>
              <li><strong style="color:#c4b5fd;">BDO / BPI:</strong> Use Payoneer's "Withdraw to Bank" — enter your account number + branch code.</li>
              <li><strong style="color:#c4b5fd;">Timing:</strong> Bank transfers usually take 1–3 business days once processed.</li>
            </ul>
          </div>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:24px 32px;text-align:center;">
          <a href="https://gamerproductions.base44.app/dashboard?tab=payment" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#ffffff;font-size:15px;font-weight:800;padding:14px 40px;border-radius:12px;text-decoration:none;">
            💳 Set Up My Payment Now →
          </a>
          <p style="color:#6b7280;font-size:11px;margin-top:12px;">Takes less than 2 minutes to link your PayPal email.</p>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#0a0f1e;padding:20px 32px;text-align:center;border-top:1px solid #1f2937;">
          <p style="color:#374151;font-size:11px;margin:0 0 4px;">© 2026 GAMER Productions · Founded by Kevin Roberto</p>
          <p style="color:#374151;font-size:11px;margin:0;">
            <a href="https://gamerproductions.base44.app" style="color:#7c3aed;text-decoration:none;">gamerproductions.base44.app</a>
            &nbsp;·&nbsp; Built for Gamers, by a Gamer 🕹️
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  let sent = 0;
  let failed = 0;

  for (const p of profiles) {
    if (!p.user_email) continue;
    const name = p.username || p.display_name || "Gamer";
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: p.user_email,
        subject: "💳 How to Link PayPal & Banking on GAMER Productions",
        body: htmlBody(name),
      });
      sent++;
    } catch (e) {
      console.error(`Failed for ${p.user_email}: ${e.message}`);
      failed++;
    }
  }

  return Response.json({ sent, failed, total: profiles.length });
});