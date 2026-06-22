import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin or system call
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { franchise_id, franchise_name, new_member_email, new_member_username } = await req.json();

    if (!franchise_id || !franchise_name || !new_member_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all members of the community
    const members = await base44.entities.CommunityMember.filter({ franchise_id });
    
    // Get their user profiles for email addresses
    const memberEmails = members.map(m => m.user_email).filter(e => e !== new_member_email);
    
    if (memberEmails.length === 0) {
      return Response.json({ success: true, notified: 0 });
    }

    // Send email notification to each member
    const emailPromises = memberEmails.map(async (email) => {
      try {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: `New Member Joined ${franchise_name}! 🎮`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">🎮 New Community Member!</h2>
              <p><strong>${new_member_username || new_member_email}</strong> has just joined the <strong>${franchise_name}</strong> community!</p>
              <p>Welcome them and start engaging in the community.</p>
              <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">You received this email because you're a member of the ${franchise_name} community.</p>
            </div>
          `,
        });
        return { email, success: true };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return { email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    return Response.json({ 
      success: true, 
      notified: successCount, 
      total: memberEmails.length,
      results 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});