"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";

interface HeaderProps {
  merchantName?: string;
  locationName?: string;
}

export function Header({ merchantName, locationName }: HeaderProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());

  return (
    <header className="border-b hidden md:block">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-bold">
              SmartDine
            </Link>
            {merchantName && (
              <div className="text-sm text-muted-foreground">
                {merchantName} {locationName && `- ${locationName}`}
              </div>
            )}
          </div>

          <Link href="/cart">
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
