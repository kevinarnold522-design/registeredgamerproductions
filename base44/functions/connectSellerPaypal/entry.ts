import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paypalEmail, paypalMerchantId, paypalConnected } = await req.json();

    // Update seller's profile with PayPal connection
    const profile = (await base44.entities.UserProfile.filter({ user_email: user.email }))[0];
    
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    await base44.entities.UserProfile.update(profile.id, {
      paypal_email: paypalEmail,
      paypal_merchant_id: paypalMerchantId,
      paypal_connected: paypalConnected,
      payout_method: 'paypal'
    });

    return Response.json({ success: true, message: 'PayPal connected successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});