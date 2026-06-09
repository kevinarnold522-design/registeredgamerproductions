import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { action, ghostData, targetEmail } = await req.json();

    if (action === 'list_ghosts') {
      const ghosts = await base44.entities.UserProfile.filter({ 
        user_email: (email) => email.includes('@ghost.gamerproductions.com')
      });
      return Response.json({ ghosts });
    }

    if (action === 'create_ghost') {
      if (!ghostData || !ghostData.username) {
        return Response.json({ error: 'Username required' }, { status: 400 });
      }

      const email = ghostData.email || `${ghostData.username.toLowerCase().replace(/\s+/g, '_')}@ghost.gamerproductions.com`;
      
      // Create user profile (ghost account)
      const profile = await base44.entities.UserProfile.create({
        user_email: email,
        username: ghostData.username,
        display_name: ghostData.display_name || ghostData.username,
        account_type: ghostData.account_type || 'regular',
        bio: ghostData.bio || 'Ghost account for testing',
        is_active: true,
        created_date: new Date().toISOString(),
      });

      return Response.json({ 
        success: true, 
        profile,
        message: 'Ghost account created. User can be invited via email.'
      });
    }

    if (action === 'impersonate') {
      if (!targetEmail) {
        return Response.json({ error: 'Target email required' }, { status: 400 });
      }

      // Just return success - frontend will open profile page with email param
      return Response.json({ 
        success: true,
        message: `Viewing as ${targetEmail}`,
        viewUrl: `/profile?email=${encodeURIComponent(targetEmail)}`
      });
    }

    if (action === 'delete_ghost') {
      if (!targetEmail) {
        return Response.json({ error: 'Target email required' }, { status: 400 });
      }

      const profiles = await base44.entities.UserProfile.filter({ user_email: targetEmail });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.delete(profiles[0].id);
      }

      return Response.json({ success: true, message: 'Ghost account deleted' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});