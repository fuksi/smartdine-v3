"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  CreditCard,
} from "lucide-react";

interface StripeConnectStatus {
  isSetup: boolean;
  isEnabled: boolean;
  requiresAction: boolean;
  requirements?: {
    currently_due?: string[];
  };
  accountId?: string;
  message?: string;
}

export default function StripeConnectPage() {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);

  // Mock location ID - in a real app this would come from user context
  const locationId = "a7915f08-b58a-41ea-9474-fe471bc3f1c8";

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `/api/admin/stripe/connect/status?locationId=${locationId}`
      );
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching Stripe status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSetupStripe = async () => {
    setSetupLoading(true);
    try {
      const response = await fetch("/api/admin/stripe/connect/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId,
          returnUrl: `${window.location.origin}/admin/stripe/return`,
          refreshUrl: `${window.location.origin}/admin/stripe/refresh`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Connect onboarding
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to setup Stripe Connect");
      }
    } catch (error) {
      console.error("Error setting up Stripe:", error);
      alert("Failed to setup Stripe Connect. Please try again.");
    } finally {
      setSetupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Payment Setup</h1>
        <p className="text-gray-600">
          Configure Stripe Connect to accept payments for your restaurant.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!status?.isSetup ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium">
                    Stripe Connect not configured
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    Setup Required
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  You need to set up Stripe Connect to accept payments. This
                  allows customers to pay securely while keeping your financial
                  information separate from the platform.
                </p>
                <Button
                  onClick={handleSetupStripe}
                  disabled={setupLoading}
                  className="bg-[#6772e5] hover:bg-[#5469d4]"
                >
                  {setupLoading ? "Setting up..." : "Setup Stripe Connect"}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : status.isEnabled ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Payments enabled</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Your restaurant can now accept payments. Account ID:{" "}
                  <code className="bg-gray-100 px-1 rounded text-xs">
                    {status.accountId}
                  </code>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Setup incomplete</span>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    Action Required
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Your Stripe Connect account needs additional information
                  before you can accept payments.
                </p>
                {status.requirements &&
                  (status.requirements.currently_due?.length ?? 0) > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm font-medium text-yellow-800 mb-2">
                        Required information:
                      </p>
                      <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                        {(status.requirements.currently_due || []).map(
                          (req: string, index: number) => (
                            <li key={index}>
                              {req
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                <Button
                  onClick={handleSetupStripe}
                  disabled={setupLoading}
                  className="bg-[#6772e5] hover:bg-[#5469d4]"
                >
                  {setupLoading ? "Continuing setup..." : "Continue Setup"}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Stripe Connect Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  1
                </div>
                <h3 className="font-medium mb-2">Customer Orders</h3>
                <p className="text-sm text-gray-600">
                  Customer places an order and enters payment details
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  2
                </div>
                <h3 className="font-medium mb-2">Payment Reserved</h3>
                <p className="text-sm text-gray-600">
                  Payment is authorized but not captured until you accept the
                  order
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  3
                </div>
                <h3 className="font-medium mb-2">You Get Paid</h3>
                <p className="text-sm text-gray-600">
                  When you accept the order, payment is captured and sent to
                  your account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Secure payments</p>
                    <p className="text-sm text-gray-600">
                      Industry-standard security and PCI compliance
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Direct deposits</p>
                    <p className="text-sm text-gray-600">
                      Payments go directly to your bank account
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Payment protection</p>
                    <p className="text-sm text-gray-600">
                      Only charged when you accept the order
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Multiple payment methods</p>
                    <p className="text-sm text-gray-600">
                      Credit cards, debit cards, and digital wallets
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
