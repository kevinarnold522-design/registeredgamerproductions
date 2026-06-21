import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import { isPageNavbarMounted, subscribePageNavbar } from "@/lib/navbarPresence";

// A single, always-visible burger nav for logged-in users. It renders on
// EVERY page so the menu is reachable everywhere. On pages that already mount
// their own AuthNavbar it stays hidden to avoid a duplicate bar.
export default function GlobalNavBurger() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [pageNavbar, setPageNavbar] = useState(isPageNavbarMounted());

  // Detect a persistent ghost/impersonation session too.
  const impersonation = (() => {
    try { return JSON.parse(localStorage.getItem("impersonation_session") || "{}"); } catch { return {}; }
  })();
  const ghostActive = impersonation?.isImpersonating && impersonation?.isPersistent;
  const loggedIn = isAuthenticated || ghostActive;

  // Track whether a page-level navbar is present (it takes priority).
  useEffect(() => {
    setPageNavbar(isPageNavbarMounted());
    const unsub = subscribePageNavbar(setPageNavbar);
    return unsub;
  }, []);

  useEffect(() => {
    const email = user?.email || impersonation?.targetEmail;
    if (!email) return;
    base44.entities.UserProfile.filter({ user_email: email })
      .then((rows) => setProfile(rows[0] || null))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  if (!loggedIn) return null;
  // A page already shows its own navbar/burger — don't duplicate it.
  if (pageNavbar) return null;

  return <AuthNavbar user={user} profile={user?.profile || profile} isGlobal />;
}