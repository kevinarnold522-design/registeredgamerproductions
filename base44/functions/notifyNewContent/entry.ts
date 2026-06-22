import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Handles both: direct calls from frontend (new post) AND entity automation (new listing).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support entity automation payload (data.community_franchise_id)
    // or direct call { franchise_id, type, title, url }
    let franchise_id, title, type, url;
    if (body.event) {
      // Entity automation payload
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

    if (!franchise_id || !title) {
      return Response.json({ sent: 0, message: "Missing data" });
    }

    const members = await base44.asServiceRole.entities.CommunityMember.filter({ franchise_id });
    if (members.length === 0) {
      return Response.json({ sent: 0, message: "No members" });
    }

    const subject = type === "listing"
      ? `🎮 New listing in your community: ${title}`
      : `📢 New post in your community: ${title}`;

    const htmlBody = `
      <div style="font-family:sans-serif;background:#050510;color:#fff;padding:32px;border-radius:16px;max-width:600px;margin:auto;">
        <h2 style="color:#a78bfa;margin-bottom:8px;">🎮 Gamer.Productions</h2>
        <h3 style="color:#fff;font-size:20px;margin-bottom:12px;">${subject}</h3>
        <p style="color:#9ca3af;margin-bottom:20px;">There's new content in a community you follow.</p>
        <div style="background:#111827;border:1px solid #374151;border-radius:12px;padding:16px;margin-bottom:20px;">
          <p style="color:#fff;font-weight:bold;margin:0 0 8px;">${title}</p>
          <p style="color:#6b7280;font-size:13px;margin:0;">Community: ${franchise_id}</p>
        </div>
        ${url ? `<a href="${url}" style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block;">View Now →</a>` : ""}
        <p style="color:#374151;font-size:11px;margin-top:24px;">You received this because you joined a gaming community on Gamer.Productions.</p>
      </div>
    `;

    const emails = [...new Set(members.map(m => m.user_email).filter(Boolean))];
    let sent = 0;
    for (const email of emails.slice(0, 50)) {
      base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject,
        body: htmlBody,
      }).catch(() => {});
      sent++;
    }

    return Response.json({ sent, message: `Notified ${sent} members` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});