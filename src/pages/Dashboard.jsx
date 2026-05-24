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
      const me = await base44.auth.me();
      setUser(me);
      if (me) {
        const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          // Check pending setup from registration
          const pending = localStorage.getItem("pending_profile");
          if (pending) {
            const data = JSON.parse(pending);
            const newProfile = await base44.entities.UserProfile.create({
              ...data,
              user_email: me.email,
              joined_date: new Date().toISOString(),
            });
            setProfile(newProfile);
            localStorage.removeItem("pending_profile");
            // Send welcome email via integration
            try {
              await base44.integrations.Core.SendEmail({
                to: me.email,
                subject: "🎮 Welcome to GAMER Productions!",
                body: `Congratulations ${data.username || me.full_name}!\n\nWelcome to GAMER Productions — the #1 gaming hub community!\n\nYou're now part of a growing community of gamers, creators, and businesses.\n\n${data.account_type !== "regular" ? "Ready to start selling? Visit your Seller Dashboard to set up your store and start listing your products or mods!\n\nHow to become a partnered seller:\n1. Complete your profile\n2. Submit verification documents\n3. Add your payout method\n4. Create your first listing\n5. Get approved and start earning!\n\n" : ""}Level up — GAMER Productions Team 🕹️`,
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

  if (!user) {
    window.location.href = "/login";
    return null;
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