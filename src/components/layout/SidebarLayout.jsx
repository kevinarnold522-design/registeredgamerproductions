import React, { useState, useEffect } from "react";
import FloatingSearch from "@/components/layout/FloatingSearch";
import { useAuth } from "@/lib/AuthContext";

// Offsets page content to the right to account for the left sidebar (desktop only).
// The left sidebar only renders for logged-in users, so logged-out visitors get no offset.
export default function SidebarLayout({ children }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar_collapsed") === "true"; } catch { return false; }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const val = localStorage.getItem("sidebar_collapsed") === "true";
        setCollapsed(v => v !== val ? val : v);
      } catch {}
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // No sidebar for logged-out users → no left offset
  const sidebarW = !user ? 0 : (collapsed ? 56 : 240);

  return (
    <>
      {/* Desktop: push content right of sidebar */}
      <style>{`
        :root { --sidebar-offset: ${sidebarW}px; }
        @media (min-width: 1024px) {
          .sidebar-page-offset { margin-left: ${sidebarW}px; transition: margin-left 0.2s; }
        }
        @media (max-width: 1023px) {
          .sidebar-page-offset { margin-left: 0; padding-top: 56px; }
        }
      `}</style>
      <FloatingSearch />
      <div className="sidebar-page-offset">
        {children}
      </div>
    </>
  );
}