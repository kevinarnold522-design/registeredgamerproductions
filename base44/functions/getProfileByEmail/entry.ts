import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Reliable, service-role read of a UserProfile by email.
// The user-scoped Worker read was returning stale data (freshly-saved avatar/
// banner URLs missing), making profile images "disappear" on refresh. Reading
// through the service role returns the true persisted record every time.
Deno.serve(async (req) => {
  try {
    const { email } = await req.json();
    if (!email) return Response.json({ error: 'email required' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: email });
    return Response.json({ profile: profiles[0] || null });
  } catch (error) {
    console.error('getProfileByEmail error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});