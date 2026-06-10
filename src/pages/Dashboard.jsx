import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import SellerDashboard from "@/components/dashboard/SellerDashboard";
import BuyerDashboard from "@/components/dashboard/BuyerDashboard";
import AuthNavbar from "@/components/layout/AuthNavbar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Check for ghost session from URL params
      const params = new URLSearchParams(window.location.search);
      const ghostEmail = params.get('ghost_email');
      
      // Check for persistent ghost session
      const impersonationData = JSON.parse(localStorage.getItem('impersonation_session') || '{}');
      const isGhostLogin = impersonationData.isImpersonating && impersonationData.isGhostLogin && impersonationData.isPersistent;
      
      let emailToLoad;
      let me = null;
      if (ghostEmail) {
        emailToLoad = ghostEmail;
      } else if (isGhostLogin) {
        emailToLoad = impersonationData.targetEmail;
      } else {
        me = await base44.auth.me();
        emailToLoad = me?.email;
        setUser(me);
      }
      
      if (!emailToLoad) { setLoading(false); return; }
      
      const profiles = await base44.entities.UserProfile.filter({ user_email: emailToLoad });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        // If ghost account, update user object with ghost data
        if (ghostEmail || isGhostLogin) {
          setUser({
            email: emailToLoad,
            full_name: profiles[0].username || impersonationData.targetUsername,
          });
        }
      } else {
        // Check pending setup from registration
        const pending = localStorage.getItem("pending_profile");
        if (pending) {
          const data = JSON.parse(pending);
          const newProfile = await base44.entities.UserProfile.create({
            ...data,
            user_email: emailToLoad,
            joined_date: new Date().toISOString(),
          });
          setProfile(newProfile);
          localStorage.removeItem("pending_profile");
          // Send beautiful HTML welcome email
          try {
            // Load custom email settings
            let emailSettings = {
              email_header_title: "Welcome to GAMER Productions!",
              email_header_subtitle: "The #1 Gaming Hub Community",
              email_header_tagline: "Level Up. Connect. Dominate.",
              email_banner_color_start: "#7c3aed",
              email_banner_color_end: "#ec4899",
            };
            try {
              const settingsRows = await base44.entities.SiteSettings.filter({ key: "welcome_email" });
              if (settingsRows.length > 0) emailSettings = { ...emailSettings, ...settingsRows[0] };
            } catch (err) {
              console.log("Using default email settings");
            }

            const username = data.username || me?.full_name || "Gamer";
            const isCreator = data.account_type === "digital_creator";
            const isBusiness = data.account_type === "business";
            const gradient = `linear-gradient(135deg, ${emailSettings.email_banner_color_start}, ${emailSettings.email_banner_color_end})`;

            const creatorSection = isCreator ? `
                <div style="background:#1e1b4b;border-radius:12px;padding:20px 24px;margin:20px 0;border-left:4px solid #a78bfa;">
                  <div style="color:#a78bfa;font-size:13px;font-weight:700;margin-bottom:8px;">🎬 DIGITAL CREATOR PERKS</div>
                  <ul style="color:#d1d5db;font-size:13px;line-height:2;margin:0;padding-left:18px;">
                    <li>Earn <strong style="color:#f9a8d4;">$1 per 1,000 views</strong> on your content</li>
                    <li>Apply for the exclusive <strong style="color:#f9a8d4;">Gaming Checkmark ✓</strong></li>
                    <li>Access AI-powered video tools &amp; script writer</li>
                    <li>Share your content with thousands of gamers</li>
                  </ul>
                </div>` : "";

            const businessSection = isBusiness ? `
                <div style="background:#052e16;border-radius:12px;padding:20px 24px;margin:20px 0;border-left:4px solid #4ade80;">
                  <div style="color:#4ade80;font-size:13px;font-weight:700;margin-bottom:8px;">🏪 BUSINESS SELLER PERKS</div>
                  <ul style="color:#d1d5db;font-size:13px;line-height:2;margin:0;padding-left:18px;">
                    <li>List products, mods, gear &amp; services</li>
                    <li>Receive payouts via <strong style="color:#4ade80;">PayPal, GCash or Maya</strong></li>
                    <li>Get verified with the seller badge</li>
                    <li>AI-powered listing assistant included</li>
                  </ul>
                </div>` : "";

            const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030712;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#030712;padding:30px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111827;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(124,58,237,0.3);">

        <!-- HERO BANNER -->
        <tr><td style="background:${gradient};padding:48px 32px;text-align:center;">
          <div style="font-size:56px;line-height:1;margin-bottom:12px;">🎮</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-bottom:10px;">GAMER PRODUCTIONS</div>
          <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0 0 8px;line-height:1.2;">${emailSettings.email_header_title}</h1>
          <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0 0 4px;">${emailSettings.email_header_subtitle}</p>
          <p style="color:rgba(255,255,255,0.6);font-size:11px;margin:0;letter-spacing:3px;text-transform:uppercase;">${emailSettings.email_header_tagline}</p>
        </td></tr>

        <!-- CONGRATS -->
        <tr><td style="padding:32px 32px 0;">
          <h2 style="color:#f9a8d4;font-size:20px;font-weight:800;margin:0 0 6px;">🎉 Congratulations, ${username}!</h2>
          <p style="color:#d1d5db;font-size:14px;line-height:1.8;margin:0 0 16px;">
            You're officially part of <strong style="color:#a78bfa;">GAMER Productions</strong> — the fastest-growing gaming community built by gamers, for gamers. 
            Founded by <strong style="color:#f9a8d4;">Kevin Roberto</strong> in 2026, we're here to connect players, creators, and businesses worldwide.
          </p>
          ${creatorSection}${businessSection}
        </td></tr>

        <!-- STEPS -->
        <tr><td style="padding:20px 32px;">
          <div style="background:#1f2937;border-radius:14px;padding:22px 24px;">
            <div style="color:#a78bfa;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">🚀 Get Started in 3 Steps</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:33%;text-align:center;padding:10px 8px;vertical-align:top;">
                  <div style="background:${emailSettings.email_banner_color_start};width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:8px;">1</div>
                  <div style="color:#f3f4f6;font-size:12px;font-weight:700;">Complete Profile</div>
                  <div style="color:#6b7280;font-size:11px;margin-top:3px;">Add your avatar &amp; bio</div>
                </td>
                <td style="width:33%;text-align:center;padding:10px 8px;vertical-align:top;">
                  <div style="background:${emailSettings.email_banner_color_end};width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:8px;">2</div>
                  <div style="color:#f3f4f6;font-size:12px;font-weight:700;">Explore Community</div>
                  <div style="color:#6b7280;font-size:11px;margin-top:3px;">Browse listings &amp; videos</div>
                </td>
                <td style="width:33%;text-align:center;padding:10px 8px;vertical-align:top;">
                  <div style="background:#1d4ed8;width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:8px;">3</div>
                  <div style="color:#f3f4f6;font-size:12px;font-weight:700;">Start Engaging</div>
                  <div style="color:#6b7280;font-size:11px;margin-top:3px;">Buy, sell, share &amp; play</div>
                </td>
              </tr>
            </table>
          </div>
        </td></tr>

        <!-- CTA BUTTON -->
        <tr><td style="padding:20px 32px;text-align:center;">
          <a href="https://gamerproductions.base44.app/dashboard" style="display:inline-block;background:${gradient};color:#ffffff;font-size:15px;font-weight:800;padding:14px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
            🕹️ Go to My Dashboard →
          </a>
        </td></tr>

        <!-- SOCIAL MEDIA -->
        <tr><td style="padding:8px 32px 24px;">
          <div style="background:#0f172a;border-radius:14px;padding:20px 24px;text-align:center;">
            <div style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;">Follow &amp; Connect With Us</div>
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="text-align:center;padding:0 6px;">
                <a href="https://facebook.com" style="display:inline-block;background:#1877f2;border-radius:10px;padding:8px 14px;color:white;font-size:12px;font-weight:700;text-decoration:none;">📘 Facebook</a>
              </td>
              <td style="text-align:center;padding:0 6px;">
                <a href="https://youtube.com" style="display:inline-block;background:#ff0000;border-radius:10px;padding:8px 14px;color:white;font-size:12px;font-weight:700;text-decoration:none;">▶️ YouTube</a>
              </td>
              <td style="text-align:center;padding:0 6px;">
                <a href="https://instagram.com" style="display:inline-block;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border-radius:10px;padding:8px 14px;color:white;font-size:12px;font-weight:700;text-decoration:none;">📸 Instagram</a>
              </td>
              <td style="text-align:center;padding:0 6px;">
                <a href="https://tiktok.com" style="display:inline-block;background:#010101;border-border:1px solid #333;border-radius:10px;padding:8px 14px;color:white;font-size:12px;font-weight:700;text-decoration:none;">🎵 TikTok</a>
              </td>
            </tr></table>
          </div>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#0a0f1e;padding:20px 32px;text-align:center;border-top:1px solid #1f2937;">
          <p style="color:#374151;font-size:11px;margin:0 0 4px;">© 2026 GAMER Productions · Founded by Kevin Roberto</p>
          <p style="color:#374151;font-size:11px;margin:0;">
            <a href="https://gamerproductions.base44.app" style="color:#7c3aed;text-decoration:none;">gamerproductions.base44.app</a>
            &nbsp;·&nbsp; Built for Gamers, by a Gamer 🕹️
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

              await base44.integrations.Core.SendEmail({
                to: me.email,
                subject: `🎮 Welcome to GAMER Productions, ${username}!`,
                body: htmlBody
              });
            } catch (e) {
              console.log("Email send skipped:", e.message);
            }
          }
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Don't redirect - Dashboard is accessed via navigation from AuthNavbar
  // If user somehow reaches here without auth, show empty state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to access the dashboard</p>
          <button onClick={() => base44.auth.redirectToLogin()} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold">Sign In</button>
        </div>
      </div>
    );
  }

  // Only block if user exists in system but has no profile AND no pending registration
  // Users with email in the system are already registered - don't block them
  if (!profile) {
    const pending = localStorage.getItem("pending_profile");
    if (!pending) {
      // No profile and no pending setup - create minimal profile automatically
      base44.entities.UserProfile.create({
        user_email: user.email,
        username: user.full_name || user.email.split('@')[0],
        display_name: user.full_name || user.email.split('@')[0],
        account_type: "regular",
        joined_date: new Date().toISOString(),
      }).then((newProfile) => {
        setProfile(newProfile);
      }).catch(console.error);
    }
  }

  const userIsAdmin = isAdmin(user.email);
  const accountType = profile?.account_type || "regular";

  return (
    <div className="min-h-screen bg-gray-950">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-16">
        {userIsAdmin ? (
          <AdminDashboard user={user} profile={profile} />
        ) : (accountType === "digital_creator" || accountType === "business") ? (
          <SellerDashboard user={user} profile={profile} />
        ) : (
          <BuyerDashboard user={user} profile={profile} />
        )}
      </div>
    </div>
  );
}