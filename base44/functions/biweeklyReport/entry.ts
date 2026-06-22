import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled calls (no user auth) but verify via service role
    const [profiles, listings, orders, videos] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.list(),
      base44.asServiceRole.entities.Listing.list(),
      base44.asServiceRole.entities.Order.list(),
      base44.asServiceRole.entities.VideoPost.list(),
    ]);

    const paidOrders = orders.filter(o => o.payment_status === "paid");
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.amount || 0), 0);
    const totalCommission = paidOrders.reduce((s, o) => s + (o.commission || 0), 0);
    const totalViews = videos.reduce((s, v) => s + (v.views || 0), 0);

    const creators = profiles.filter(p => p.account_type === "digital_creator");
    const businesses = profiles.filter(p => p.account_type === "business");
    const regular = profiles.filter(p => p.account_type === "regular");
    const verifiedCount = profiles.filter(p => p.is_verified).length;

    // Top 5 sellers by revenue
    const topSellers = profiles
      .filter(p => p.total_revenue > 0)
      .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
      .slice(0, 5);

    // Top 5 creators by views
    const topCreators = creators
      .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
      .slice(0, 5);

    const reportDate = new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - 14 * 24 * 60 * 60 * 1000);
    const period = `${periodStart.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} – ${periodEnd.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`;

    const topSellersRows = topSellers.map((s, i) =>
      `<tr style="border-bottom:1px solid #1f2937;">
        <td style="padding:10px 16px;color:#d1d5db;font-size:13px;">${["🥇","🥈","🥉","4️⃣","5️⃣"][i]} ${s.username}</td>
        <td style="padding:10px 16px;color:#4ade80;font-weight:700;font-size:13px;">₱${(s.total_revenue||0).toLocaleString()}</td>
        <td style="padding:10px 16px;color:#a78bfa;font-size:13px;">${s.total_sales || 0} sales</td>
        <td style="padding:10px 16px;font-size:12px;"><span style="background:${s.account_type==="business"?"#052e16":"#1e1b4b"};color:${s.account_type==="business"?"#4ade80":"#a78bfa"};padding:2px 8px;border-radius:6px;">${s.account_type}</span></td>
      </tr>`
    ).join("");

    const topCreatorsRows = topCreators.map((c, i) =>
      `<tr style="border-bottom:1px solid #1f2937;">
        <td style="padding:10px 16px;color:#d1d5db;font-size:13px;">${["🥇","🥈","🥉","4️⃣","5️⃣"][i]} ${c.username}</td>
        <td style="padding:10px 16px;color:#60a5fa;font-weight:700;font-size:13px;">${(c.total_views||0).toLocaleString()} views</td>
        <td style="padding:10px 16px;color:#f9a8d4;font-size:13px;">${(c.youtube_subscribers||0).toLocaleString()} subs</td>
        <td style="padding:10px 16px;color:#4ade80;font-weight:700;font-size:13px;">$${((c.total_views||0)/1000).toFixed(2)}</td>
      </tr>`
    ).join("");

    const htmlReport = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030712;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:30px 16px;">
  <tr><td align="center">
  <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#111827;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(124,58,237,0.25);">

    <!-- HEADER -->
    <tr><td style="background:linear-gradient(135deg,#1e1b4b,#4c1d95,#7c3aed,#ec4899);padding:40px 32px;text-align:center;">
      <div style="font-size:42px;margin-bottom:8px;">🕹️</div>
      <div style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px;">GAMER Productions</div>
      <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 6px;">Bi-Weekly Platform Report</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">Report Period: ${period}</p>
      <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:4px 0 0;">Generated: ${reportDate}</p>
    </td></tr>

    <!-- PLATFORM STATS -->
    <tr><td style="padding:28px 32px 0;">
      <div style="color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">📊 Platform Overview</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:25%;text-align:center;padding:12px 6px;">
            <div style="background:#1e1b4b;border-radius:12px;padding:14px 8px;border:1px solid #4c1d95;">
              <div style="color:#a78bfa;font-size:20px;font-weight:900;">${profiles.length}</div>
              <div style="color:#6b7280;font-size:10px;margin-top:3px;">Total Users</div>
            </div>
          </td>
          <td style="width:25%;text-align:center;padding:12px 6px;">
            <div style="background:#052e16;border-radius:12px;padding:14px 8px;border:1px solid #166534;">
              <div style="color:#4ade80;font-size:20px;font-weight:900;">₱${totalRevenue.toLocaleString()}</div>
              <div style="color:#6b7280;font-size:10px;margin-top:3px;">Total Revenue</div>
            </div>
          </td>
          <td style="width:25%;text-align:center;padding:12px 6px;">
            <div style="background:#1c1917;border-radius:12px;padding:14px 8px;border:1px solid #44403c;">
              <div style="color:#fbbf24;font-size:20px;font-weight:900;">₱${totalCommission.toLocaleString()}</div>
              <div style="color:#6b7280;font-size:10px;margin-top:3px;">Commission Earned</div>
            </div>
          </td>
          <td style="width:25%;text-align:center;padding:12px 6px;">
            <div style="background:#0c0a1a;border-radius:12px;padding:14px 8px;border:1px solid #312e81;">
              <div style="color:#60a5fa;font-size:20px;font-weight:900;">${totalViews.toLocaleString()}</div>
              <div style="color:#6b7280;font-size:10px;margin-top:3px;">Total Video Views</div>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- USER BREAKDOWN -->
    <tr><td style="padding:20px 32px 0;">
      <div style="color:#a78bfa;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">👥 User Breakdown</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;overflow:hidden;">
        <tr style="background:#111827;">
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Type</th>
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Count</th>
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Verified</th>
        </tr>
        <tr style="border-bottom:1px solid #374151;">
          <td style="padding:10px 16px;color:#60a5fa;font-weight:700;font-size:13px;">👤 Regular Gamers</td>
          <td style="padding:10px 16px;color:#d1d5db;font-size:13px;">${regular.length}</td>
          <td style="padding:10px 16px;color:#4ade80;font-size:13px;">${regular.filter(p=>p.is_verified).length}</td>
        </tr>
        <tr style="border-bottom:1px solid #374151;">
          <td style="padding:10px 16px;color:#a78bfa;font-weight:700;font-size:13px;">🎨 Digital Creators</td>
          <td style="padding:10px 16px;color:#d1d5db;font-size:13px;">${creators.length}</td>
          <td style="padding:10px 16px;color:#4ade80;font-size:13px;">${creators.filter(p=>p.is_verified).length}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#4ade80;font-weight:700;font-size:13px;">🏢 Business Owners</td>
          <td style="padding:10px 16px;color:#d1d5db;font-size:13px;">${businesses.length}</td>
          <td style="padding:10px 16px;color:#4ade80;font-size:13px;">${businesses.filter(p=>p.is_verified).length}</td>
        </tr>
      </table>
    </td></tr>

    <!-- TOP SELLERS -->
    ${topSellers.length > 0 ? `
    <tr><td style="padding:20px 32px 0;">
      <div style="color:#4ade80;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">🏆 Top Sellers This Period</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;overflow:hidden;">
        <tr style="background:#111827;">
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Seller</th>
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Revenue</th>
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Sales</th>
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Type</th>
        </tr>
        ${topSellersRows}
      </table>
    </td></tr>` : ""}

    <!-- TOP CREATORS -->
    ${topCreators.length > 0 ? `
    <tr><td style="padding:20px 32px 0;">
      <div style="color:#60a5fa;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">🎬 Top Creators This Period</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:12px;overflow:hidden;">
        <tr style="background:#111827;">
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Creator</th>
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Views</th>
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Subscribers</th>
          <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;">Est. Earnings</th>
        </tr>
        ${topCreatorsRows}
      </table>
    </td></tr>` : ""}

    <!-- MARKETPLACE STATS -->
    <tr><td style="padding:20px 32px 0;">
      <div style="color:#fbbf24;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">🛒 Marketplace Stats</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 6px 0 0;width:50%;">
            <div style="background:#1f2937;border-radius:12px;padding:14px 16px;border:1px solid #374151;">
              <div style="color:#fbbf24;font-size:16px;font-weight:900;">${listings.length}</div>
              <div style="color:#6b7280;font-size:11px;">Total Listings</div>
              <div style="color:#4ade80;font-size:11px;margin-top:2px;">${listings.filter(l=>l.status==="active").length} active</div>
            </div>
          </td>
          <td style="padding:0 0 0 6px;width:50%;">
            <div style="background:#1f2937;border-radius:12px;padding:14px 16px;border:1px solid #374151;">
              <div style="color:#f9a8d4;font-size:16px;font-weight:900;">${orders.length}</div>
              <div style="color:#6b7280;font-size:11px;">Total Orders</div>
              <div style="color:#4ade80;font-size:11px;margin-top:2px;">${paidOrders.length} paid</div>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- SOCIAL -->
    <tr><td style="padding:20px 32px;">
      <div style="background:#0f172a;border-radius:14px;padding:18px 20px;text-align:center;">
        <div style="color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Follow GAMER Productions</div>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="text-align:center;padding:0 4px;"><a href="https://facebook.com" style="display:inline-block;background:#1877f2;border-radius:8px;padding:7px 12px;color:white;font-size:11px;font-weight:700;text-decoration:none;">📘 Facebook</a></td>
          <td style="text-align:center;padding:0 4px;"><a href="https://youtube.com" style="display:inline-block;background:#ff0000;border-radius:8px;padding:7px 12px;color:white;font-size:11px;font-weight:700;text-decoration:none;">▶️ YouTube</a></td>
          <td style="text-align:center;padding:0 4px;"><a href="https://instagram.com" style="display:inline-block;background:linear-gradient(45deg,#f09433,#dc2743,#bc1888);border-radius:8px;padding:7px 12px;color:white;font-size:11px;font-weight:700;text-decoration:none;">📸 Instagram</a></td>
          <td style="text-align:center;padding:0 4px;"><a href="https://tiktok.com" style="display:inline-block;background:#111;border-radius:8px;padding:7px 12px;color:white;font-size:11px;font-weight:700;text-decoration:none;">🎵 TikTok</a></td>
        </tr></table>
      </div>
    </td></tr>

    <!-- FOOTER -->
    <tr><td style="background:#0a0f1e;padding:18px 32px;text-align:center;border-top:1px solid #1f2937;">
      <p style="color:#374151;font-size:11px;margin:0 0 3px;">© 2026 GAMER Productions · Bi-Weekly Report · CEO & President: Kevin Roberto</p>
      <p style="color:#374151;font-size:11px;margin:0;"><a href="https://gamerproductions.base44.app" style="color:#7c3aed;text-decoration:none;">gamerproductions.base44.app</a> · Built for Gamers 🕹️</p>
    </td></tr>

  </table>
  </td></tr>
  </table>
</body>
</html>`;

    // Get all admin emails from the settings
    const ADMIN_EMAILS = ["kevinjersey2019@gmail.com", "arnoldk137@gmail.com", "kevinarnold522@gmail.com"];

    // Send to all admins
    for (const adminEmail of ADMIN_EMAILS) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `📊 GAMER Productions · Bi-Weekly Report · ${period}`,
        body: htmlReport,
      });
    }

    return Response.json({
      success: true,
      message: `Bi-weekly report sent to ${ADMIN_EMAILS.length} admin(s)`,
      period,
      stats: { users: profiles.length, revenue: totalRevenue, commission: totalCommission, orders: orders.length, views: totalViews },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});