import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { streak = 0, nextReward = "Daily Login Bonus", userEmail, username } = body;

    const daysToGo = Math.max(0, 365 - streak);
    const progressPct = Math.min(100, Math.round((streak / 365) * 100));

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #050510; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #0d0d1a; border-radius: 20px; overflow: hidden; }
    .hero { background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 40px 30px; text-align: center; }
    .hero h1 { color: #fff; font-size: 28px; font-weight: 900; margin: 0 0 8px; }
    .hero p { color: rgba(255,255,255,0.85); font-size: 15px; margin: 0; }
    .gift-icon { font-size: 64px; display: block; margin-bottom: 16px; }
    .content { padding: 32px 30px; }
    .streak-box { background: linear-gradient(135deg, #1a0a2e, #0a1a2e); border: 2px solid #7c3aed44; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; }
    .streak-number { font-size: 52px; font-weight: 900; color: #f59e0b; line-height: 1; }
    .streak-label { color: #9ca3af; font-size: 13px; margin-top: 4px; }
    .progress-bar { background: #1a1a2e; border-radius: 999px; height: 10px; margin: 16px 0 8px; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #7c3aed, #ec4899, #f59e0b); height: 100%; border-radius: 999px; transition: width 0.5s; }
    .progress-text { color: #6b7280; font-size: 12px; }
    .reward-card { background: #0a0a1a; border: 2px solid #7c3aed33; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .reward-title { color: #a78bfa; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .reward-item { color: #fff; font-size: 18px; font-weight: 900; }
    .cta-btn { display: block; background: linear-gradient(135deg, #7c3aed, #ec4899); color: #fff; text-decoration: none; padding: 18px 32px; border-radius: 16px; font-size: 18px; font-weight: 900; text-align: center; margin: 24px 0; letter-spacing: 0.5px; }
    .milestone { background: linear-gradient(135deg, #1a1000, #2a1500); border: 2px solid #f59e0b44; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .milestone h3 { color: #f59e0b; font-weight: 900; font-size: 16px; margin: 0 0 8px; }
    .milestone p { color: #9ca3af; font-size: 13px; margin: 0; }
    .footer { padding: 24px 30px; border-top: 1px solid #1a1a2e; text-align: center; }
    .footer p { color: #4b5563; font-size: 12px; margin: 0; }
    .social-links { display: flex; justify-content: center; gap: 16px; margin-bottom: 16px; }
    .social-link { color: #7c3aed; text-decoration: none; font-size: 13px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="hero">
      <span class="gift-icon">🎁</span>
      <h1>Your Daily Reward Awaits!</h1>
      <p>Hey ${username || "Gamer"} — log in now to claim your reward and keep your streak alive! 🔥</p>
    </div>

    <div class="content">
      <div class="streak-box">
        <div class="streak-number">🔥 ${streak}</div>
        <div class="streak-label">Day Streak</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPct}%"></div>
        </div>
        <div class="progress-text">${streak}/365 days to the $10 USD Grand Prize (${daysToGo} days to go!)</div>
      </div>

      <div class="reward-card">
        <div class="reward-title">Today's Reward</div>
        <div class="reward-item">${nextReward}</div>
      </div>

      <div class="milestone">
        <h3>🏆 365-Day Legend Incentive — $10 USD!</h3>
        <p>Log in every single day for 365 days straight and earn <strong style="color:#f59e0b">$10 USD via PayPal</strong>! You're currently ${daysToGo} days away from becoming a Legend. Don't break your streak!</p>
      </div>

      <a href="https://gamerproductions.vercel.app" class="cta-btn">
        🎮 Claim My Daily Reward Now →
      </a>

      <div class="social-links">
        <a href="https://www.facebook.com/share/1D9ey9w8Rw/?mibextid=wwXIfr" class="social-link">📘 Facebook</a>
        <a href="https://youtube.com/@registeredgamerproductions?si=WfWn2yT15uvp5LnF" class="social-link">▶️ YouTube</a>
      </div>
    </div>

    <div class="footer">
      <p>You're receiving this because you're a GAMER.Productions member.</p>
      <p style="margin-top:4px;">© 2025 GAMER.Productions — The #1 Gaming Hub Community</p>
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail || user.email,
      subject: `🎁 ${username || "Gamer"}, your Day ${streak + 1} reward is waiting! 🔥 ${streak} day streak`,
      body: emailHtml,
      from_name: "GAMER.Productions Rewards",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});