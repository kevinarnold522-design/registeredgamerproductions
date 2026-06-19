import { createClient } from 'npm:@supabase/supabase-js@2';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_EMAILS = [
    'kevinjersey2019@gmail.com',
    'arnoldk137@gmail.com',
    'kevinarnold522@gmail.com',
];

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
        console.error('loginAsGhost supabase verify failed', err.message);
        return null;
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json().catch(() => ({}));
        const { target_email, accessToken } = body;

        const user = await getSupabaseUser(req, accessToken);
        const isAdmin = user && ADMIN_EMAILS.includes(String(user.email || '').toLowerCase());
        if (!isAdmin) {
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