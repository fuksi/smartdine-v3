"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CustomerLogin } from "@/components/customer-login";
import { useCustomerAuth } from "@/lib/auth/CustomerAuthProvider";
import { User, LogOut } from "lucide-react";

export function CustomerAuthButton() {
  const [showLogin, setShowLogin] = useState(false);
  const { customer, logout, isLoading } = useCustomerAuth();

  // Handle escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLogin) {
        setShowLogin(false);
      }
    };

    if (showLogin) {
      document.addEventListener("keydown", handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showLogin]);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-4 w-4" />
      </Button>
    );
  }

  if (customer) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 hidden sm:inline">
          Hi, {customer.firstName || "Customer"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:ml-1 sm:inline">Logout</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowLogin(true)}
        className="text-gray-600 hover:text-gray-900"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:ml-1 sm:inline">Login</span>
      </Button>

      {showLogin && (
        <>
          {/* Modal Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowLogin(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-[61] p-4 pointer-events-none">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full pointer-events-auto">
              <button
                onClick={() => setShowLogin(false)}
                className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10 border border-gray-200 transition-colors"
                aria-label="Close login modal"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <CustomerLogin onSuccess={() => setShowLogin(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
