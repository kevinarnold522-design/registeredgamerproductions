import { createClient } from 'npm:@supabase/supabase-js@2';
import { requireAdminUser } from '../_shared/adminAuth.ts';

const SUPA_URL = () => {
    const raw = Deno.env.get('VITE_SUPABASE_URL');
    return (raw && raw.startsWith('http')) ? raw : 'https://smymannqqogtshvsiqyp.supabase.co';
};

// Header columns are real columns; everything else lives inside the jsonb `data`.
const HEADER = new Set(['id', 'created_date', 'updated_date', 'created_by_id', 'created_by']);
function flatten(row) {
    if (!row) return row;
    const { data, ...header } = row;
    return { ...(data || {}), ...header };
}

function makeManagedAccountPassword() {
    return `Ghost-${crypto.randomUUID()}!aA1`;
}

function isDuplicateAuthUserError(error) {
    const message = String(error?.message || '').toLowerCase();
    return message.includes('already') && (message.includes('registered') || message.includes('exists'));
}

async function ensureManagedAuthUser(supabase, email, profileData) {
    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password: makeManagedAccountPassword(),
            email_confirm: true,
            user_metadata: {
                username: profileData.username,
                display_name: profileData.display_name,
                account_type: profileData.account_type,
                is_managed_account: true,
                managed_by_admin: profileData.managed_by_admin,
            },
        });
        if (error) {
            if (isDuplicateAuthUserError(error)) return { created: false, userId: null };
            throw error;
        }
        return { created: true, userId: data.user?.id || null };
    } catch (error) {
        if (isDuplicateAuthUserError(error)) return { created: false, userId: null };
        throw error;
    }
}

Deno.serve(async (req) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { action, email, username, avatar_url, display_name, account_type, target_email, include_all, accessToken } = body;

        const user = await requireAdminUser(req, accessToken);
        if (!user) {
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

            const normalizedUsername = String(username).trim();
            const finalEmail = (email && String(email).includes('@'))
                ? String(email).trim().toLowerCase()
                : `${normalizedUsername.toLowerCase().replace(/\s+/g, '_')}@gamerproductions.com`;

            const existingUsers = await filterData('UserProfile', 'user_email', finalEmail);
            if (existingUsers.length > 0) {
                return Response.json({ error: 'Email already registered' }, { status: 400 });
            }

            const profileData = {
                user_email: finalEmail,
                username: normalizedUsername,
                display_name: display_name || normalizedUsername,
                account_type: account_type || 'regular',
                avatar_url: avatar_url || '',
                is_managed_account: true,
                managed_by_admin: user.email,
                joined_date: new Date().toISOString(),
            };

            const authUser = await ensureManagedAuthUser(supabase, finalEmail, profileData);
            if (authUser.userId) {
                profileData.supabase_auth_user_id = authUser.userId;
            }

            try {
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
                    auth_user_created: authUser.created,
                });
            } catch (error) {
                if (authUser.created && authUser.userId) {
                    try {
                        await supabase.auth.admin.deleteUser(authUser.userId);
                    } catch (cleanupError) {
                        console.error('createManagedAccount auth cleanup failed', cleanupError.message);
                    }
                }
                throw error;
            }
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