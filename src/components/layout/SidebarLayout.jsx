import React, { useState, useEffect } from "react";
import FloatingSearch from "@/components/layout/FloatingSearch";
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
      <FloatingSearch />
      <div className={user ? "lg:ml-[var(--sidebar-offset)]" : ""} style={user ? { "--sidebar-offset": `${offset}px`, transition: "margin-left 0.25s ease" } : undefined}>
        {children}
      </div>
    </>
  );
}