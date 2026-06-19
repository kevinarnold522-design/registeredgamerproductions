import { createClient } from 'npm:@supabase/supabase-js@2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_EMAILS = [
    'kevinjersey2019@gmail.com',
    'arnoldk137@gmail.com',
    'kevinarnold522@gmail.com',
];

// Verify the Supabase access token (auth migrated from Base44 -> Supabase).
// Token can come from the Authorization header OR the request body — the SDK
// does not reliably forward custom headers, so the body is the dependable path.
async function getSupabaseUser(req, bodyToken) {
    const headerToken = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const token = headerToken || bodyToken || '';
    if (!token) return null;
    const url = Deno.env.get('VITE_SUPABASE_URL');
    const key = Deno.env.get('VITE_SUPABASE_ANON_KEY');
    if (!url || !key) return null;
    try {
        const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return { id: user.id, email: user.email, role: (user.user_metadata || {}).role };
    } catch (err) {
        console.error('createManagedAccount supabase verify failed', err.message);
        return null;
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json().catch(() => ({}));
        const { action, email, username, avatar_url, display_name, account_type, target_email, include_all, accessToken } = body;

        // Authenticate via Supabase + admin allow-list.
        const user = await getSupabaseUser(req, accessToken);
        const isAdmin = user && ADMIN_EMAILS.includes(String(user.email || '').toLowerCase());
        if (!isAdmin) {
            console.error('createManagedAccount forbidden', { email: user?.email || null, action });
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const db = base44.asServiceRole.entities;

        // List accounts. By default only managed accounts; pass include_all:true
        // to list EVERY account so an admin can switch into any of them.
        if (action === 'list') {
            const managedAccounts = include_all
                ? await db.UserProfile.list('-created_date', 1000)
                : await db.UserProfile.filter({ is_managed_account: true });

            const accountsWithStats = await Promise.all(
                managedAccounts.map(async (account) => {
                    const [listings, posts, follows] = await Promise.all([
                        db.Listing.filter({ seller_email: account.user_email }).catch(() => []),
                        db.CommunityPost.filter({ author_email: account.user_email }).catch(() => []),
                        db.Follow.filter({ follower_email: account.user_email }).catch(() => []),
                    ]);
                    return {
                        ...account,
                        stats: {
                            listings: listings.length,
                            posts: posts.length,
                            following: follows.length,
                        }
                    };
                })
            );

            return Response.json({ success: true, accounts: accountsWithStats });
        }

        // Create a new managed account
        if (action === 'create') {
            if (!username) {
                return Response.json({ error: 'Username is required' }, { status: 400 });
            }

            const finalEmail = (email && email.includes('@'))
                ? email
                : `${username.toLowerCase().replace(/\s+/g, '_')}@gamerproductions.com`;

            const existingUsers = await db.UserProfile.filter({ user_email: finalEmail });
            if (existingUsers.length > 0) {
                return Response.json({ error: 'Email already registered' }, { status: 400 });
            }

            // Try to invite the auth user — but don't fail the whole create if the
            // invite can't be sent (fake/placeholder emails will reject). The
            // UserProfile is the real source of truth for managed accounts.
            try {
                await base44.users.inviteUser(finalEmail, 'user');
            } catch (inviteErr) {
                console.warn('inviteUser skipped for managed account', finalEmail, inviteErr.message);
            }

            const profile = await db.UserProfile.create({
                user_email: finalEmail,
                username: username,
                display_name: display_name || username,
                account_type: account_type || 'regular',
                avatar_url: avatar_url || '',
                is_managed_account: true,
                managed_by_admin: user.email,
                joined_date: new Date().toISOString(),
            });

            return Response.json({
                success: true,
                message: 'Managed account created successfully',
                profile: profile,
                email: finalEmail,
            });
        }

        // Get impersonation info
        if (action === 'impersonate') {
            if (!target_email) {
                return Response.json({ error: 'Target email required' }, { status: 400 });
            }

            const targetAccount = await db.UserProfile.filter({ user_email: target_email });
            if (targetAccount.length === 0) {
                return Response.json({ error: 'Account not found' }, { status: 404 });
            }

            return Response.json({
                success: true,
                target_email: target_email,
                username: targetAccount[0].username,
                display_name: targetAccount[0].display_name,
                avatar_url: targetAccount[0].avatar_url,
                account_type: targetAccount[0].account_type || 'regular',
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in createManagedAccount:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});