import React, { useState, useEffect } from "react";

// Offsets page content to the right to account for the left sidebar (desktop only)
export default function SidebarLayout({ children }) {
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

  const sidebarW = collapsed ? 56 : 240;

  return (
    <>
      {/* Desktop: push content right of sidebar */}
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-page-offset { margin-left: ${sidebarW}px; transition: margin-left 0.2s; }
        }
        @media (max-width: 1023px) {
          .sidebar-page-offset { margin-left: 0; padding-top: 56px; }
        }
      `}</style>
      <div className="sidebar-page-offset">
        {children}
      </div>
    </>
  );
}