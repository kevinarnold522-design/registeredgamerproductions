import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MASTER_EMAIL = 'kevinarnold522@gmail.com';
const ALLOWED_FIELDS = ['avatar_url', 'banner_url'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile_id, field, value } = await req.json();
    if (!profile_id || !ALLOWED_FIELDS.includes(field)) {
      return Response.json({ error: 'Invalid profile media update' }, { status: 400 });
    }

    const profile = await base44.asServiceRole.entities.UserProfile.get(profile_id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const isMasterAdmin = String(user.email || '').toLowerCase() === MASTER_EMAIL.toLowerCase() || user.role === 'admin';
    const isOwnProfile = String(profile.user_email || '').toLowerCase() === String(user.email || '').toLowerCase();
    if (!isMasterAdmin && !isOwnProfile) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await base44.asServiceRole.entities.UserProfile.update(profile_id, { [field]: value || '' });
    return Response.json({ success: true, profile: updated });
  } catch (error) {
    console.error('updateProfileMedia error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});