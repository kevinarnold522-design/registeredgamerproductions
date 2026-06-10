import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Only admins can login as managed accounts
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const { target_email } = body;

        if (!target_email) {
            return Response.json({ error: 'Target email required' }, { status: 400 });
        }

        // Verify the account exists and is managed
        const targetAccount = await base44.entities.UserProfile.filter({ 
            user_email: target_email,
            is_managed_account: true 
        });

        if (targetAccount.length === 0) {
            return Response.json({ error: 'Account not found or not a managed account' }, { status: 404 });
        }

        // Generate a login token for the target account
        // This creates a session that allows the admin to login as the ghost account
        const loginToken = await base44.auth.generateImpersonationToken(target_email);

        return Response.json({ 
            success: true, 
            login_token: loginToken,
            target_email: target_email,
            username: targetAccount[0].username,
            display_name: targetAccount[0].display_name,
            avatar_url: targetAccount[0].avatar_url
        });

    } catch (error) {
        console.error('Error in loginAsGhost:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});