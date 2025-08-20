"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { useRestaurant } from "@/lib/restaurant-context";
import { CustomerAuthButton } from "@/components/customer-auth-button";

export function StickyTopBar() {
  const { getTotalItems, getTotalPrice } = useCartStore();
  const pathname = usePathname();
  const restaurant = useRestaurant();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Hide on admin pages and cart page
  if (pathname === "/cart" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Restaurant Name */}
          <div className="flex-1 min-w-0">
            {restaurant?.restaurantName && (
              <h1 className="text-xl font-bold text-gray-900 truncate">
                {restaurant.restaurantName}
              </h1>
            )}
          </div>

          {/* Right side: Auth button and Cart */}
          <div className="flex items-center gap-3">
            <CustomerAuthButton />

            {/* Cart Button */}
            {totalItems > 0 && (
              <div className="flex-shrink-0">
                <Link href="/cart">
                  <Button
                    size="sm"
                    className="bg-[hsl(var(--brand-secondary))] hover:bg-[hsl(var(--brand-secondary-hover))] text-white rounded-xl px-5 py-2.5 flex items-center gap-3 shadow-lg transition-all duration-200 hover:shadow-xl"
                  >
                    <div className="bg-white/20 rounded-lg p-1.5">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm">
                      €{totalPrice.toFixed(2)}
                    </span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
