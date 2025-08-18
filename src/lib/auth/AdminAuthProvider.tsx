"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminUser {
  id: string;
  email: string;
  locationId: string;
  location: {
    id: string;
    name: string;
    merchant: {
      name: string;
    };
  };
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, otp?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  sendOtp: (
    email: string
  ) => Promise<{ success: boolean; skipOtp?: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        // Redirect to login if on admin route but not authenticated
        if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const sendOtp = async (email: string) => {
    try {
      const response = await fetch("/api/admin/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        skipOtp: data.skipOtp,
        error: data.error,
      };
    } catch {
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  };

  const login = async (email: string, otp?: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/admin/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, sendOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
