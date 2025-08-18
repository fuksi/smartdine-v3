"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutButtonProps {
  orderId: string;
  totalAmount: number;
  disabled?: boolean;
}

export default function CheckoutButton({
  orderId,
  totalAmount,
  disabled,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      // Create checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          successUrl: `${window.location.origin}/your-order?id=${orderId}`,
          cancelUrl: `${window.location.origin}/cart`,
        }),
      });

      const { sessionId, url, error } = await response.json();

      if (error) {
        alert(`Payment error: ${error}`);
        return;
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            alert(`Stripe error: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout process");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className="w-full"
      size="lg"
    >
      {loading ? "Processing..." : `Pay €${totalAmount.toFixed(2)}`}
    </Button>
  );
}
