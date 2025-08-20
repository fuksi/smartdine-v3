"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription, DialogBody } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEuro, formatEuroModifier } from "@/lib/currency";
import { SerializedProduct } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart";

interface ProductModalProps {
  product: SerializedProduct;
  locationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({
  product,
  locationId,
  isOpen,
  onClose,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const { addItem, setLocation } = useCartStore();

  const handleOptionChange = (
    optionId: string,
    valueId: string,
    isMultiSelect: boolean
  ) => {
    setSelectedOptions((prev) => {
      if (isMultiSelect) {
        const current = prev[optionId] || [];
        if (current.includes(valueId)) {
          return {
            ...prev,
            [optionId]: current.filter((id) => id !== valueId),
          };
        } else {
          return {
            ...prev,
            [optionId]: [...current, valueId],
          };
        }
      } else {
        return {
          ...prev,
          [optionId]: [valueId],
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = product.price;

    Object.entries(selectedOptions).forEach(([optionId, valueIds]) => {
      const option = product.options.find((o) => o.id === optionId);
      if (option) {
        valueIds.forEach((valueId) => {
          const value = option.optionValues.find((v) => v.id === valueId);
          if (value) {
            total += value.priceModifier;
          }
        });
      }
    });

    return total * quantity;
  };

  const handleAddToCart = () => {
    // Set the location ID in the cart store
    setLocation(locationId);

    const cartOptions = Object.entries(selectedOptions).flatMap(
      ([optionId, valueIds]) => {
        const option = product.options.find((o) => o.id === optionId);
        return valueIds.map((valueId) => {
          const value = option?.optionValues.find((v) => v.id === valueId);
          return {
            optionId,
            optionName: option?.name || "",
            valueId,
            valueName: value?.name || "",
            priceModifier: value?.priceModifier || 0,
          };
        });
      }
    );

    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      options: cartOptions,
    });

    onClose();
    setQuantity(1);
    setSelectedOptions({});
  };

  const canAddToCart = product.options
    .filter((option) => option.isRequired)
    .every((option) => selectedOptions[option.id]?.length > 0);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto z-50">
          <Dialog.Close className="absolute top-4 right-4">
            <X className="h-5 w-5" />
          </Dialog.Close>

          <div className="space-y-4">
            {product.imageUrl && (
              <div className="relative h-48 w-full">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <div>
              <Dialog.Title className="text-xl font-semibold">
                {product.name}
              </Dialog.Title>
              {product.description && (
                <Dialog.Description className="text-muted-foreground mt-1">
                  {product.description}
                </Dialog.Description>
              )}
              <div className="text-lg font-semibold mt-2">
                {formatEuro(Number(product.price))}
              </div>
            </div>

            {product.options.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="font-medium">
                  {option.name}
                  {option.isRequired && (
                    <span className="text-red-500"> *</span>
                  )}
                </div>

                {option.type === "RADIO" ? (
                  <RadioGroup.Root
                    value={selectedOptions[option.id]?.[0] || ""}
                    onValueChange={(value) =>
                      handleOptionChange(option.id, value, false)
                    }
                  >
                    {option.optionValues.map((value) => (
                      <div
                        key={value.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroup.Item
                          value={value.id}
                          className="w-4 h-4 rounded-full border border-input bg-background"
                        >
                          <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-primary" />
                        </RadioGroup.Item>
                        <label className="text-sm flex-1 flex justify-between">
                          <span>{value.name}</span>
                          {value.priceModifier > 0 && (
                            <span>
                              {formatEuroModifier(Number(value.priceModifier))}
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </RadioGroup.Root>
                ) : (
                  <div className="space-y-2">
                    {option.optionValues.map((value) => (
                      <div
                        key={value.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox.Root
                          checked={
                            selectedOptions[option.id]?.includes(value.id) ||
                            false
                          }
                          onCheckedChange={() =>
                            handleOptionChange(option.id, value.id, true)
                          }
                          className="w-4 h-4 rounded border border-input bg-background"
                        >
                          <Checkbox.Indicator className="flex items-center justify-center text-primary">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 15 15"
                              fill="none"
                            >
                              <path
                                d="m11.4669 3.72684c.5584.39049.6927 1.17476.2923 1.71693L7.35844 12.7169C6.90987 13.3223 6.00837 13.3023 5.58598 12.6869l-3.5-5.0684c-.55-1.1-.11-2.46.98-3.01.72-.36 1.59-.09 2.02.59L6.41542 8.13674l3.89866-6.2c.4123-.65601 1.2638-.83801 1.8468-.42801.30109.21102.51949.54766.58022.91107.04826.29009-.00448.59149-.11308.86814z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label className="text-sm flex-1 flex justify-between">
                          <span>{value.name}</span>
                          {value.priceModifier > 0 && (
                            <span>
                              {formatEuroModifier(Number(value.priceModifier))}
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1 ml-4"
              >
                Add to Cart - {formatEuro(calculateTotalPrice())}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
