import React from "react";
import ManagedAccountsPanel from "@/components/admin/ManagedAccountsPanel";
import { useAuth } from "@/lib/AuthContext";
import { Navigate } from "react-router-dom";

export default function CreatedAccountsPage() {
  const { user, isLoadingAuth } = useAuth();
  const MASTER_EMAIL = "kevinarnold522@gmail.com";

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. If there is no user session object at all, bounce them instantly
  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  // 2. Safe email extraction across different potential Base44 data schemas
  const currentEmail = user?.email || user?.attributes?.email || user?.primaryEmail || "";

  // 3. 🚨 STALIN-GRADE LOCK: Only kevinarnold522@gmail.com matches true. Everyone else fails.
  const isMasterAdmin = currentEmail.toLowerCase() === MASTER_EMAIL.toLowerCase();

  if (!isMasterAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Only your exact email account can ever reach this return statement
  return (
    <div className="min-h-screen bg-gray-950">
      <ManagedAccountsPanel />
    </div>
  );
}
