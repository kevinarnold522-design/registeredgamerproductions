import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AIVideoStudio from "@/components/videos/AIVideoStudio";
import AuthNavbar from "@/components/layout/AuthNavbar";

export default function AIVideoStudioPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      if (me?.email) {
        const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
        if (profiles.length > 0) setProfile(profiles[0]);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-16">
        <AIVideoStudio
          user={user}
          profile={profile}
          onVideoCreated={() => window.history.back()}
        />
      </div>
    </div>
  );
}