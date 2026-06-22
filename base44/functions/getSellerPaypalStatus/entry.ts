import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create seller's PayPal connected account
    const profile = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];
    
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if seller has PayPal connected
    if (!profile.paypal_connected || !profile.paypal_merchant_id) {
      return Response.json({ 
        connected: false, 
        message: 'PayPal not connected',
        connectUrl: 'https://www.paypal.com/signin' // Will be replaced with OAuth flow
      });
    }

    return Response.json({
      connected: true,
      paypal_email: profile.paypal_email,
      paypal_merchant_id: profile.paypal_merchant_id,
      payout_method: profile.payout_method
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});