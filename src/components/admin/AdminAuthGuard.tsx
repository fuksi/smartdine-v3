"use client";

import { useAdminAuth } from "@/lib/auth/AdminAuthProvider";
import { usePathname } from "next/navigation";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAdminAuth();
  const pathname = usePathname();

  // Don't guard the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated
  if (user) {
    return <>{children}</>;
  }

  // User is not authenticated - the AuthProvider will redirect to login
  return null;
}
