"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEuro } from "@/lib/currency";
import { Truck } from "lucide-react";
import { SerializedProduct } from "@/lib/types";
import { ProductModal } from "./product-modal";

interface ProductCardProps {
  product: SerializedProduct;
  merchantId: string;
  merchantSlug: string;
}

export function ProductCard({
  product,
  merchantId,
  merchantSlug,
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white shadow-md border-0 rounded-lg overflow-hidden"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative h-48 w-full">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-muted rounded-t-lg flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
          {product.description && (
            <CardDescription className="mb-3 line-clamp-2">
              {product.description}
            </CardDescription>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              {formatEuro(Number(product.price))}
            </span>
            <div className="flex items-center gap-2">
              {product.canShip && (
                <Badge
                  variant="outline"
                  className="text-xs border-green-500 text-green-700 bg-green-50"
                >
                  <Truck className="h-3 w-3 mr-1" />
                  Shippable
                </Badge>
              )}
              {!isAdminPage && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                >
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductModal
        product={product}
        merchantId={merchantId}
        merchantSlug={merchantSlug}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
