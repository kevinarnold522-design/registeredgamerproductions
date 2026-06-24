import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { requireAdminUser } from '../_shared/adminAuth.ts';

// Entities an admin is allowed to mutate through this endpoint.
const ALLOWED_ENTITIES = ['Listing', 'CommunityPost', 'UserProfile', 'GamingCommunity'];
const ALLOWED_ACTIONS = ['update', 'create'];

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { entity, action = 'update', id, data, accessToken } = body;

    const user = await requireAdminUser(req, accessToken);
    if (!user) return Response.json({ error: 'Forbidden' }, { status: 403 });

    if (!ALLOWED_ENTITIES.includes(entity) || !ALLOWED_ACTIONS.includes(action) || !data) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    let result;
    if (action === 'create') {
      result = await base44.asServiceRole.entities[entity].create(data);
    } else {
      if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
      result = await base44.asServiceRole.entities[entity].update(id, data);
    }
    return Response.json({ success: true, result });
  } catch (error) {
    console.error('adminUpdateEntity error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});