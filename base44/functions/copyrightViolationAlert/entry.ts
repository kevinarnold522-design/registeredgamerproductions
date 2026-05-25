import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { creator_email, creator_username, video_title, risk_level, issues, video_url } = body;

    const issuesList = (issues || []).map((i, idx) => `${idx + 1}. ${i}`).join("\n");

    // Email to creator
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: creator_email,
      subject: `⚠️ Copyright Alert: "${video_title}" — Action Required`,
      body: `Hi ${creator_username},

Your recently uploaded video has been flagged by our AI copyright scanner.

📹 Video: ${video_title}
⚠️ Risk Level: ${risk_level}

Potential Issues Detected:
${issuesList || "No specific issues listed."}

What this means:
• Your video may contain copyrighted music, clips, or content
• Platforms like YouTube or Facebook may claim/remove it
• You could receive a copyright strike on external platforms

What to do:
1. Review the flagged content before publishing
2. Replace any copyrighted music with royalty-free alternatives
3. Remove or replace third-party clips you don't have rights to
4. Use GAMER Productions AI Music Advisor for safe music options

If you believe this is a false positive, the admin team will review your submission.

Stay safe and keep creating!
GAMER Productions Team`,
    });

    // Find all admin users and notify them
    const adminUsers = await base44.asServiceRole.entities.User.filter({ role: "admin" });

    for (const adminUser of adminUsers) {
      // In-app notification for admin
      await base44.asServiceRole.entities.Notification.create({
        user_email: adminUser.email,
        type: "system",
        title: `⚠️ Copyright Alert: ${video_title}`,
        message: `Video by ${creator_username} flagged at ${risk_level} risk. Review in Videos tab.`,
        is_read: false,
        link: "/dashboard?tab=videos",
      });

      // Email admin
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: adminUser.email,
        subject: `🚨 Copyright Violation Alert — Admin Review Required`,
        body: `A video has been flagged for potential copyright violations.

📹 Video Title: ${video_title}
👤 Creator: ${creator_username} (${creator_email})
⚠️ Risk Level: ${risk_level}

Issues Detected:
${issuesList || "General copyright risk detected."}

${video_url ? `📎 Video URL: ${video_url}` : ""}

Required Actions:
1. Review the video content immediately
2. Choose: APPROVE or REMOVE from platform
3. Notify the creator of your decision

Login to Admin Dashboard → Videos tab to manage this content.

GAMER Productions Copyright Protection System`,
      });
    }

    return Response.json({ success: true, message: "Copyright alerts sent." });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});