import { createClient } from 'npm:@supabase/supabase-js@2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_EMAILS = [
    'kevinjersey2019@gmail.com',
    'arnoldk137@gmail.com',
    'kevinarnold522@gmail.com',
];

// Fallback: also recognise the admin via the Base44 / Cloudflare session cookie.
// Admins may be authenticated through Base44 rather than a live Supabase token,
// in which case getSupabaseUser() returns null and ghost-account creation 403s.
async function getBase44User(req) {
    try {
        const base44 = createClientFromRequest(req);
        const u = await base44.auth.me();
        return u ? { email: u.email, role: u.role } : null;
    } catch (_) {
        return null;
    }
}

const SUPA_URL = () => {
    const raw = Deno.env.get('VITE_SUPABASE_URL');
    return (raw && raw.startsWith('http')) ? raw : 'https://smymannqqogtshvsiqyp.supabase.co';
};

// Verify the Supabase access token (auth migrated from Base44 -> Supabase).
// Token can come from the Authorization header OR the request body.
async function getSupabaseUser(req, bodyToken) {
    const headerToken = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const token = headerToken || bodyToken || '';
    if (!token) return null;
    const key = Deno.env.get('VITE_SUPABASE_ANON_KEY');
    if (!key) return null;
    try {
        const supabase = createClient(SUPA_URL(), key, { auth: { persistSession: false, autoRefreshToken: false } });
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return { id: user.id, email: user.email, role: (user.user_metadata || {}).role };
    } catch (err) {
        console.error('createManagedAccount supabase verify failed', err.message);
        return null;
    }
}

// Header columns are real columns; everything else lives inside the jsonb `data`.
const HEADER = new Set(['id', 'created_date', 'updated_date', 'created_by_id', 'created_by']);
function flatten(row) {
    if (!row) return row;
    const { data, ...header } = row;
    return { ...(data || {}), ...header };
}

Deno.serve(async (req) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { action, email, username, avatar_url, display_name, account_type, target_email, include_all, accessToken } = body;

        // Authenticate via Supabase, falling back to the Base44 session cookie.
        let user = await getSupabaseUser(req, accessToken);
        if (!user) user = await getBase44User(req);
        const isAdmin = user && ADMIN_EMAILS.includes(String(user.email || '').toLowerCase());
        if (!isAdmin) {
            console.error('createManagedAccount forbidden', { email: user?.email || null, action });
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!serviceKey) {
            return Response.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
        }
        const supabase = createClient(SUPA_URL(), serviceKey, { auth: { persistSession: false } });

        // Helper: filter a table by a field inside the jsonb data column.
        async function filterData(table, field, value) {
            const { data, error } = await supabase.from(table).select('*').eq(`data->>${field}`, String(value));
            if (error) throw new Error(error.message);
            return (data || []).map(flatten);
        }

        // List accounts. By default only managed accounts; pass include_all:true
        // to list EVERY account so an admin can switch into any of them.
        if (action === 'list') {
            let accounts;
            if (include_all) {
                const { data, error } = await supabase.from('UserProfile').select('*').order('created_date', { ascending: false }).limit(1000);
                if (error) throw new Error(error.message);
                accounts = (data || []).map(flatten);
            } else {
                accounts = await filterData('UserProfile', 'is_managed_account', true);
            }

            const accountsWithStats = await Promise.all(
                accounts.map(async (account) => {
                    const [listings, posts, follows] = await Promise.all([
                        filterData('Listing', 'seller_email', account.user_email).catch(() => []),
                        filterData('CommunityPost', 'author_email', account.user_email).catch(() => []),
                        filterData('Follow', 'follower_email', account.user_email).catch(() => []),
                    ]);
                    return {
                        ...account,
                        stats: { listings: listings.length, posts: posts.length, following: follows.length },
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

            const existingUsers = await filterData('UserProfile', 'user_email', finalEmail);
            if (existingUsers.length > 0) {
                return Response.json({ error: 'Email already registered' }, { status: 400 });
            }

            const profileData = {
                user_email: finalEmail,
                username: username,
                display_name: display_name || username,
                account_type: account_type || 'regular',
                avatar_url: avatar_url || '',
                is_managed_account: true,
                managed_by_admin: user.email,
                joined_date: new Date().toISOString(),
            };

            const { data: inserted, error } = await supabase
                .from('UserProfile')
                .insert({ created_by: user.email, data: profileData })
                .select('*')
                .single();
            if (error) throw new Error(error.message);

            return Response.json({
                success: true,
                message: 'Managed account created successfully',
                profile: flatten(inserted),
                email: finalEmail,
            });
        }

        // Get impersonation info
        if (action === 'impersonate') {
            if (!target_email) {
                return Response.json({ error: 'Target email required' }, { status: 400 });
            }

            const targetAccount = await filterData('UserProfile', 'user_email', target_email);
            if (targetAccount.length === 0) {
                return Response.json({ error: 'Account not found' }, { status: 404 });
            }

            const t = targetAccount[0];
            return Response.json({
                success: true,
                target_email: target_email,
                username: t.username,
                display_name: t.display_name,
                avatar_url: t.avatar_url,
                account_type: t.account_type || 'regular',
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in createManagedAccount:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});