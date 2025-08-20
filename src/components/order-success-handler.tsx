"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";

export function OrderSuccessHandler() {
  const { clearCartForLocation } = useCartStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the location_id from URL params if available
    const locationId = searchParams.get("location_id");

    if (locationId) {
      // Clear cart for the specific location after successful payment
      clearCartForLocation(locationId);
    }
  }, [clearCartForLocation, searchParams]);

  // This component doesn't render anything visible
  return null;
}
