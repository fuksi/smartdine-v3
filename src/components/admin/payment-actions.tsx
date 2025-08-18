"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, CreditCard, AlertTriangle } from "lucide-react";

interface PaymentActionsProps {
  orderId: string;
  paymentStatus: string;
  orderStatus: string;
  onPaymentAction: () => void;
}

export function PaymentActions({
  orderId,
  paymentStatus,
  orderStatus,
  onPaymentAction,
}: PaymentActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCapturePayment = async () => {
    if (
      !confirm(
        "Are you sure you want to accept this order and capture payment?"
      )
    ) {
      return;
    }

    setLoading("capture");
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/capture-payment`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to capture payment");
      }

      alert("Payment captured successfully! Order has been accepted.");
      onPaymentAction();
    } catch (error) {
      console.error("Error capturing payment:", error);
      alert(
        `Failed to capture payment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(null);
    }
  };

  const handleCancelPayment = async () => {
    if (
      !confirm("Are you sure you want to reject this order and cancel payment?")
    ) {
      return;
    }

    setLoading("cancel");
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/cancel-payment`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel payment");
      }

      alert("Payment canceled successfully! Order has been rejected.");
      onPaymentAction();
    } catch (error) {
      console.error("Error canceling payment:", error);
      alert(
        `Failed to cancel payment: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(null);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-gray-100">
            <CreditCard className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "AUTHORIZED":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Authorized
          </Badge>
        );
      case "CAPTURED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Canceled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Payment:</span>
        {getPaymentStatusBadge(paymentStatus)}
      </div>

      {paymentStatus === "AUTHORIZED" && orderStatus === "PLACED" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={handleCapturePayment}
            disabled={loading === "capture"}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading === "capture"
              ? "Processing..."
              : "Accept & Capture Payment"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelPayment}
            disabled={loading === "cancel"}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            {loading === "cancel" ? "Processing..." : "Reject & Cancel Payment"}
          </Button>
        </div>
      )}

      {paymentStatus === "PENDING" && (
        <p className="text-sm text-amber-600">⚠️ Payment not yet completed</p>
      )}
    </div>
  );
}
