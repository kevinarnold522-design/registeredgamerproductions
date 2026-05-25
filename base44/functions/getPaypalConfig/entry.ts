import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    if (!clientId) return Response.json({ error: "PayPal not configured" }, { status: 500 });

    // Only expose client ID (public key), never the secret
    return Response.json({ clientId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});