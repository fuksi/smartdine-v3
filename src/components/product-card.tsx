"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SerializedProduct } from "@/lib/types";
import { ProductModal } from "./product-modal";

interface ProductCardProps {
  product: SerializedProduct;
  locationId: string;
}

export function ProductCard({ product, locationId }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              ${product.price.toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductModal
        product={product}
        locationId={locationId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
