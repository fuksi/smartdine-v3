"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { PhoneInput } from "./ui/phone-input";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, MessageSquare, Phone } from "lucide-react";

interface SMSConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customerPhone: string) => void;
  totalAmount: number;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

export function SMSConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
  totalAmount,
  customerInfo,
}: SMSConfirmationModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState(customerInfo.phone);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(true);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send SMS");
      }

      setStep("otp");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send SMS");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode.trim()) {
      setError("Please enter the SMS code");
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
          firstName: customerInfo.name,
          email: customerInfo.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid SMS code");
      }

      onSuccess(phoneNumber);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid SMS code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("phone");
    setOtpCode("");
    setError("");
    onClose();
  };

  const handlePhoneChange = (phone: string, isValid: boolean) => {
    setPhoneNumber(phone);
    setIsPhoneValid(isValid);
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center">
            {step === "phone" ? "Confirm Order with SMS" : "Enter SMS Code"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "phone"
              ? "We'll send a confirmation code to your phone"
              : "Please enter the code we sent to your phone"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Order Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{customerInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">€{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span>Pay at shop</span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-600 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {step === "phone" ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <PhoneInput
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendOTP}
                  className="flex-1"
                  disabled={isLoading || !isPhoneValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send SMS Code"
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  SMS Code
                </label>
                <Input
                  type="text"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="text-sm text-muted-foreground text-center">
                Code sent to {phoneNumber}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("phone")}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={verifyOTP}
                  className="flex-1"
                  disabled={isLoading || otpCode.length < 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
