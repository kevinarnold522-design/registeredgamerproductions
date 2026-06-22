import React, { useState, useEffect } from "react";
import FloatingSearch from "@/components/layout/FloatingSearch";
import GlobalNavBurger from "@/components/layout/GlobalNavBurger";
import { useAuth } from "@/lib/AuthContext";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/components/layout/AuthNavbar";

// Logged-in users get a persistent fixed LEFT sidebar on desktop (with the
// animated controller), and a top hamburger bar on mobile/tablet.
export default function SidebarLayout({ children }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar_collapsed") === "true"; } catch { return false; }
  });

  // Keep the page offset in sync when the sidebar is collapsed/expanded.
  useEffect(() => {
    const sync = () => {
      try { setCollapsed(localStorage.getItem("sidebar_collapsed") === "true"); } catch {}
    };
    window.addEventListener("storage", sync);
    const interval = setInterval(sync, 400);
    return () => { window.removeEventListener("storage", sync); clearInterval(interval); };
  }, []);

  const offset = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <>
      {/* Always-visible burger nav for logged-in users on EVERY page */}
      <GlobalNavBurger />
      <div>
        <FloatingSearch />
        {children}
      </div>
    </>
  );
}