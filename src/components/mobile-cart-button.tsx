"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";

export function MobileCartButton() {
  const { getTotalItems, getTotalPrice } = useCartStore();
  const pathname = usePathname();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Hide cart button on admin pages, cart page and when cart is empty
  if (
    totalItems === 0 ||
    pathname === "/cart" ||
    pathname.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <Link href="/cart">
        <Button
          size="lg"
          className="w-full bg-[hsl(var(--brand-secondary))] hover:bg-[hsl(var(--brand-secondary-hover))] text-white shadow-lg rounded-2xl py-4 px-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <span className="font-semibold">View order</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">€{totalPrice.toFixed(2)}</div>
          </div>
        </Button>
      </Link>
    </div>
  );
}
