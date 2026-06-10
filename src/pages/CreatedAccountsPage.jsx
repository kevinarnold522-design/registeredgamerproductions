import React from "react";
import ManagedAccountsPanel from "@/components/admin/ManagedAccountsPanel";
import { useAuth } from "@/lib/AuthContext";
import { Navigate } from "react-router-dom";

export default function CreatedAccountsPage() {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Only admins can access
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <ManagedAccountsPanel />
    </div>
  );
}