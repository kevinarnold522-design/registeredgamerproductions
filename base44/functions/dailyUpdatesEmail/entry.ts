import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dry_run === true;

    const [users, listings, posts] = await Promise.all([
      base44.asServiceRole.entities.User.list('-created_date', 1000),
      base44.asServiceRole.entities.Listing.filter({ status: 'active' }, '-created_date', 5),
      base44.asServiceRole.entities.CommunityPost.filter({ status: 'active' }, '-created_date', 5),
    ]);

    const recipients = users.filter((u) => u?.email).map((u) => ({
      email: u.email,
      name: u.full_name || 'Gamer',
    }));

    const listingItems = listings.map((item) => `<li><strong>${item.title || 'New listing'}</strong>${item.price ? ` — ₱${Number(item.price).toLocaleString()}` : ' — FREE'}</li>`).join('');
    const postItems = posts.map((item) => `<li>${String(item.content || '').slice(0, 120)}</li>`).join('');

    const bodyHtml = (name) => `
      <div style="background:#050510;color:#f8fafc;font-family:Arial,sans-serif;padding:24px">
        <div style="max-width:640px;margin:0 auto;background:#111827;border:1px solid #312e81;border-radius:18px;padding:24px">
          <h1 style="margin:0 0 8px;color:#c4b5fd">Daily GAMER.Productions Update</h1>
          <p style="color:#d1d5db">Hi ${name}, here are today's latest community updates from real activity on the site.</p>
          <h2 style="font-size:16px;color:#93c5fd;margin-top:22px">Latest listings</h2>
          <ul style="color:#e5e7eb;line-height:1.7">${listingItems || '<li>No new active listings today.</li>'}</ul>
          <h2 style="font-size:16px;color:#93c5fd;margin-top:22px">Latest community posts</h2>
          <ul style="color:#e5e7eb;line-height:1.7">${postItems || '<li>No new active community posts today.</li>'}</ul>
          <a href="https://gamerproductions.vercel.app" style="display:inline-block;margin-top:18px;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700">Open GAMER.Productions</a>
        </div>
      </div>`;

    if (dryRun) {
      return Response.json({ success: true, dry_run: true, recipients: recipients.length, listings: listings.length, posts: posts.length });
    }

    let sent = 0;
    let failed = 0;
    for (let i = 0; i < recipients.length; i += 10) {
      const batch = recipients.slice(i, i + 10);
      const results = await Promise.allSettled(batch.map((recipient) => base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient.email,
        subject: 'Your daily GAMER.Productions update',
        body: bodyHtml(recipient.name),
        from_name: 'GAMER.Productions Updates',
      })));
      sent += results.filter((r) => r.status === 'fulfilled').length;
      failed += results.filter((r) => r.status === 'rejected').length;
    }

    return Response.json({ success: true, recipients: recipients.length, sent, failed });
  } catch (error) {
    console.error('dailyUpdatesEmail error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});