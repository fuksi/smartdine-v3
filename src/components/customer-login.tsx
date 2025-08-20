"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCustomerAuth } from "@/lib/auth/CustomerAuthProvider";
import { Phone, MessageSquare, User, Mail, ArrowLeft } from "lucide-react";

type Step = "phone" | "otp" | "signup";

interface LoginResponse {
  success: boolean;
  message: string;
  customerExists: boolean;
  phone: string;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  customer: {
    id: string;
    phone: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  token: string;
}

export function CustomerLogin({ onSuccess }: { onSuccess?: () => void }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useCustomerAuth();

  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as 04X XXX XXXX or 05X XXX XXXX
    if (digits.length >= 3) {
      if (digits.length <= 6) {
        return digits.replace(/(\d{3})(\d{1,3})/, "$1 $2");
      } else {
        return digits.replace(/(\d{3})(\d{3})(\d{1,4})/, "$1 $2 $3");
      }
    }
    return digits;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        setStep(data.customerExists ? "otp" : "signup");
      } else {
        setError(data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          otp,
          ...(step === "signup" && { firstName, email }),
        }),
      });

      const data: VerifyResponse = await response.json();

      if (data.success) {
        login(data.token, data.customer);
        onSuccess?.();
      } else {
        setError(data.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "otp" || step === "signup") {
      setStep("phone");
      setOtp("");
      setFirstName("");
      setEmail("");
      setError("");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Phone className="h-5 w-5" />
          {step === "phone" && "Enter Your Phone Number"}
          {step === "otp" && "Enter Verification Code"}
          {step === "signup" && "Complete Your Profile"}
        </CardTitle>
        <CardDescription>
          {step === "phone" && "We'll send you a verification code via SMS"}
          {step === "otp" && `Code sent to ${phone}`}
          {step === "signup" && "You're new! Let's get you set up"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Finnish Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="04X XXX XXXX"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => setPhone(e.target.value.replace(/\s/g, ""))}
                required
                maxLength={12}
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                Enter your Finnish mobile number (starting with 04 or 05)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || phone.length < 9}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>
        )}

        {(step === "otp" || step === "signup") && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mb-2 p-0 h-auto font-normal text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Change phone number
            </Button>

            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="text-sm font-medium flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Verification Code
              </label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                maxLength={6}
                className="text-lg text-center tracking-widest"
              />
            </div>

            {step === "signup" && (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Full Name *
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your full name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                otp.length !== 6 ||
                (step === "signup" && !firstName)
              }
            >
              {isLoading
                ? "Verifying..."
                : step === "signup"
                ? "Create Account"
                : "Verify Code"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
