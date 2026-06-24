import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { requireAdminUser } from '../_shared/adminAuth.ts';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json().catch(() => ({}));
        const { target_email, accessToken } = body;

        const user = await requireAdminUser(req, accessToken);
        if (!user) {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        if (!target_email) {
            return Response.json({ error: 'Target email required' }, { status: 400 });
        }

        const targetAccount = await base44.asServiceRole.entities.UserProfile.filter({ user_email: target_email });
        if (targetAccount.length === 0) {
            return Response.json({ error: 'Account not found' }, { status: 404 });
        }

        return Response.json({
            success: true,
            target_email: target_email,
            username: targetAccount[0].username,
            display_name: targetAccount[0].display_name || targetAccount[0].username,
            avatar_url: targetAccount[0].avatar_url || '',
            account_type: targetAccount[0].account_type || 'regular',
            redirect_url: `/profile?email=${encodeURIComponent(target_email)}&ghost_session=1`
        });

    } catch (error) {
        console.error('Error in loginAsGhost:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});