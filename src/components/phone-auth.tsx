"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, KeyRound } from "lucide-react";

interface PhoneAuthProps {
  onAuthSuccess: (phoneNumber: string) => void;
  onCancel: () => void;
}

export function PhoneAuth({ onAuthSuccess, onCancel }: PhoneAuthProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const sendOTP = async () => {
    if (!isPhoneValid || !phoneNumber.trim()) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP code");
      }

      onAuthSuccess(phoneNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP code");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setOtpCode("");
    setError("");
    await sendOTP();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {step === "phone" ? (
            <>
              <Phone className="h-5 w-5" />
              Phone Verification
            </>
          ) : (
            <>
              <KeyRound className="h-5 w-5" />
              Enter OTP Code
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "phone" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <PhoneInput
                value={phoneNumber}
                onChange={(value, isValid) => {
                  setPhoneNumber(value);
                  setIsPhoneValid(isValid);
                }}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={sendOTP}
                disabled={isLoading || !isPhoneValid}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">OTP Code</label>
              <p className="text-sm text-muted-foreground mb-3">
                We&apos;ve sent a 6-digit code to {phoneNumber}
              </p>
              <Input
                type="text"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtpCode(value);
                }}
                placeholder="Enter 6-digit code"
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={verifyOTP}
                disabled={isLoading || otpCode.length !== 6}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Continue
              </Button>
              <Button
                variant="outline"
                onClick={resendOTP}
                disabled={isLoading}
              >
                Resend
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={() => setStep("phone")}
              className="w-full"
            >
              Change Phone Number
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
