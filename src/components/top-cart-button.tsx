"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";

export function TopCartButton() {
  const { getTotalItems, getTotalPrice } = useCartStore();
  const pathname = usePathname();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Hide cart button on cart page and when cart is empty
  if (totalItems === 0 || pathname === "/cart") {
    return null;
  }

  return (
    <div className="hidden md:block fixed top-4 right-4 z-50">
      <Link href="/cart">
        <Button
          size="lg"
          className="bg-[hsl(var(--brand-secondary))] hover:bg-[hsl(var(--brand-secondary-hover))] text-white shadow-lg rounded-2xl py-4 px-6 flex items-center gap-3"
        >
          <div className="bg-white/20 rounded-full p-2">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-semibold">View order</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">€{totalPrice.toFixed(2)}</div>
            <div className="text-sm opacity-90 hidden sm:block">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </div>
          </div>
        </Button>
      </Link>
    </div>
  );
}
