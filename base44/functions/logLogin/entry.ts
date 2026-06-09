import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    let deviceType = "desktop";
    if (/mobile/i.test(userAgent)) deviceType = "mobile";
    else if (/tablet/i.test(userAgent)) deviceType = "tablet";

    let browser = "Unknown";
    if (/chrome/i.test(userAgent)) browser = "Chrome";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";
    else if (/safari/i.test(userAgent)) browser = "Safari";
    else if (/edg/i.test(userAgent)) browser = "Edge";

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    
    await base44.entities.LoginHistory.create({
      user_email: user.email,
      login_date: new Date().toISOString(),
      ip_address: ip,
      device_type: deviceType,
      browser: browser,
      location: "Philippines",
      success: true,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});