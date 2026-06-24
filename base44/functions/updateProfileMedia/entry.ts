import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getRequestUser, isAdminUser } from '../_shared/adminAuth.ts';
const ALLOWED_FIELDS = ['avatar_url', 'banner_url', 'avatar_urls', 'profile_theme_color'];

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { profile_id, field, value, updates, accessToken } = body;

    const user = await getRequestUser(req, accessToken);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Build the set of fields to write — supports a single {field,value} OR an {updates} object.
    let payload = {};
    if (updates && typeof updates === 'object') {
      for (const k of Object.keys(updates)) {
        if (ALLOWED_FIELDS.includes(k)) payload[k] = updates[k];
      }
    } else if (field && ALLOWED_FIELDS.includes(field)) {
      payload[field] = value ?? '';
    }
    if (!profile_id || Object.keys(payload).length === 0) {
      return Response.json({ error: 'Invalid profile media update' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const profile = await base44.asServiceRole.entities.UserProfile.get(profile_id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const isMasterAdmin = isAdminUser(user);
    const isOwnProfile = String(profile.user_email || '').toLowerCase() === String(user.email || '').toLowerCase();
    if (!isMasterAdmin && !isOwnProfile) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await base44.asServiceRole.entities.UserProfile.update(profile_id, payload);
    return Response.json({ success: true, profile: updated });
  } catch (error) {
    console.error('updateProfileMedia error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});