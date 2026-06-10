import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Only admins can create managed accounts
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const { action, email, username, avatar_url, display_name, account_type, target_email } = body;

        // List all managed accounts
        if (action === 'list') {
            const managedAccounts = await base44.entities.UserProfile.filter({ 
                is_managed_account: true 
            });
            
            // Get counts for each account
            const accountsWithStats = await Promise.all(
                managedAccounts.map(async (account) => {
                    const listings = await base44.entities.Listing.filter({ seller_email: account.user_email });
                    const posts = await base44.entities.CommunityPost.filter({ author_email: account.user_email });
                    const follows = await base44.entities.Follow.filter({ follower_email: account.user_email });
                    
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
            if (!email || !username) {
                return Response.json({ error: 'Email and username are required' }, { status: 400 });
            }

            // Check if email already exists
            const existingUsers = await base44.entities.UserProfile.filter({ user_email: email });
            if (existingUsers.length > 0) {
                return Response.json({ error: 'Email already registered' }, { status: 400 });
            }

            // Invite the user (creates the auth account)
            await base44.users.inviteUser(email, 'user');

            // Create the user profile
            const profile = await base44.entities.UserProfile.create({
                user_email: email,
                username: username,
                display_name: display_name || username,
                account_type: account_type || 'regular',
                avatar_url: avatar_url || '',
                is_managed_account: true,
                managed_by_admin: user.email,
                created_date: new Date().toISOString(),
            });

            return Response.json({ 
                success: true, 
                message: 'Managed account created successfully',
                profile: profile 
            });
        }

        // Get impersonation info
        if (action === 'impersonate') {
            if (!target_email) {
                return Response.json({ error: 'Target email required' }, { status: 400 });
            }

            // Verify the account is managed
            const targetAccount = await base44.entities.UserProfile.filter({ 
                user_email: target_email,
                is_managed_account: true 
            });

            if (targetAccount.length === 0) {
                return Response.json({ error: 'Account not found or not a managed account' }, { status: 404 });
            }

            // Return account info for session switching
            return Response.json({ 
                success: true, 
                target_email: target_email,
                username: targetAccount[0].username,
                display_name: targetAccount[0].display_name,
                avatar_url: targetAccount[0].avatar_url
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in createManagedAccount:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});