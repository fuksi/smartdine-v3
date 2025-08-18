"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogOut, Users, Store, CreditCard } from "lucide-react";

interface SuperAdmin {
  email: string;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  location?: {
    id: string;
    name: string;
    merchant: {
      name: string;
    };
  };
}

interface MerchantLocation {
  id: string;
  name: string;
  stripeConnectAccountId?: string;
  stripeConnectEnabled: boolean;
  merchant: {
    name: string;
  };
}

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<SuperAdmin | null>(null);
  const [activeTab, setActiveTab] = useState<"admins" | "stripe">("admins");

  // Login state
  const [loginStep, setLoginStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("phuc.trandt@outlook.com");
  const [otp, setOtp] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Data state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [locations, setLocations] = useState<MerchantLocation[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/superadmin/me");
      if (response.ok) {
        const data = await response.json();
        setAdmin(data);
        setIsAuthenticated(true);
        loadData();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [adminsRes, locationsRes] = await Promise.all([
        fetch("/api/superadmin/admins"),
        fetch("/api/superadmin/stripe"),
      ]);

      if (adminsRes.ok) {
        const adminsData = await adminsRes.json();
        setAdmins(adminsData.admins);
      }

      if (locationsRes.ok) {
        const locationsData = await locationsRes.json();
        setLocations(locationsData.locations);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleSendOtp = async () => {
    setLoginLoading(true);
    setError("");

    try {
      const response = await fetch("/api/superadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setLoginStep("otp");
        // In development, show the OTP code
        if (data.code) {
          alert(`Development OTP: ${data.code}`);
        }
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoginLoading(true);
    setError("");

    try {
      const response = await fetch("/api/superadmin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setAdmin({ email });
        loadData();
      } else {
        setError(data.error || "Failed to verify OTP");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/superadmin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setAdmin(null);
      setLoginStep("email");
      setOtp("");
      setOtpSent(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const setupStripeConnect = async (
    locationId: string,
    businessName: string
  ) => {
    try {
      const response = await fetch("/api/superadmin/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          email: "restaurant@example.com", // You can make this configurable
          businessName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe onboarding
        window.open(data.onboardingUrl, "_blank");
        // Refresh data after a delay
        setTimeout(loadData, 2000);
      } else {
        alert(data.error || "Failed to set up Stripe Connect");
      }
    } catch (error) {
      alert("Network error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              SuperAdmin Login
            </CardTitle>
            <p className="text-muted-foreground">
              {loginStep === "email"
                ? "Enter your authorized email"
                : "Enter the OTP code"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {loginStep === "email" ? (
              <>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginLoading}
                />
                <Button
                  onClick={handleSendOtp}
                  disabled={!email || loginLoading}
                  className="w-full"
                >
                  {loginLoading ? "Sending..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground text-center">
                  OTP sent to {email}
                </div>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={loginLoading}
                  className="text-center text-lg tracking-widest"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLoginStep("email");
                      setOtp("");
                      setError("");
                    }}
                    disabled={loginLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || loginLoading}
                    className="flex-1"
                  >
                    {loginLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSendOtp}
                  disabled={loginLoading}
                  className="w-full text-sm"
                >
                  Resend OTP
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SuperAdmin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {admin?.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "admins" ? "default" : "outline"}
            onClick={() => setActiveTab("admins")}
          >
            <Users className="w-4 h-4 mr-2" />
            Restaurant Admins
          </Button>
          <Button
            variant={activeTab === "stripe" ? "default" : "outline"}
            onClick={() => setActiveTab("stripe")}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Stripe Connect
          </Button>
        </div>

        {/* Content */}
        {activeTab === "admins" && (
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{admin.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {admin.role} • {admin.location?.merchant.name} -{" "}
                        {admin.location?.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          admin.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "stripe" && (
          <Card>
            <CardHeader>
              <CardTitle>Stripe Connect Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {location.merchant.name} - {location.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Account ID:{" "}
                        {location.stripeConnectAccountId || "Not set up"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          location.stripeConnectEnabled
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {location.stripeConnectEnabled
                          ? "Connected"
                          : "Not Connected"}
                      </span>
                      {!location.stripeConnectAccountId && (
                        <Button
                          size="sm"
                          onClick={() =>
                            setupStripeConnect(
                              location.id,
                              `${location.merchant.name} - ${location.name}`
                            )
                          }
                        >
                          Set up Stripe
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
