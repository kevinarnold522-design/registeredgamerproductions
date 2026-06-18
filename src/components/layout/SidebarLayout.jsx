import React from "react";
import FloatingSearch from "@/components/layout/FloatingSearch";
import { useAuth } from "@/lib/AuthContext";

// Logged-in users get a fixed top bar with a hamburger menu (no persistent left sidebar),
// so pages only need top padding. Logged-out visitors get no offset.
export default function SidebarLayout({ children }) {
  const { user } = useAuth();

  // Logged-in users get a fixed top bar (hamburger menu) — no left offset, just top padding.
  return (
    <>
      <style>{`
        :root { --sidebar-offset: 0px; }
        .sidebar-page-offset { margin-left: 0; }
      `}</style>
      <FloatingSearch />
      <div className="sidebar-page-offset">
        {children}
      </div>
    </>
  );
}