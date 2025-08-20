"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Minus, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { SerializedProduct } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart";

interface ProductModalProps {
  product: SerializedProduct;
  merchantId: string;
  merchantSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({
  product,
  merchantId,
  merchantSlug,
  isOpen,
  onClose,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const [validationErrors, setValidationErrors] = useState<Set<string>>(
    new Set()
  );
  const { addItem, setLocation } = useCartStore();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  // Auto-select default options when modal opens
  useEffect(() => {
    if (isOpen && product.options.length > 0) {
      const defaultOptions: Record<string, string[]> = {};

      product.options.forEach((option) => {
        const defaultValues = option.optionValues.filter((v) => v.isDefault);
        if (defaultValues.length > 0) {
          defaultOptions[option.id] = defaultValues.map((v) => v.id);
        }
      });

      setSelectedOptions(defaultOptions);
    }
  }, [isOpen, product.options]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
      setSelectedOptions({});
      setValidationErrors(new Set());
    }
  }, [isOpen]);

  const handleOptionChange = (
    optionId: string,
    valueId: string,
    isMultiSelect: boolean
  ) => {
    setSelectedOptions((prev) => {
      let newOptions;

      if (isMultiSelect) {
        const current = prev[optionId] || [];
        if (current.includes(valueId)) {
          newOptions = {
            ...prev,
            [optionId]: current.filter((id) => id !== valueId),
          };
        } else {
          newOptions = {
            ...prev,
            [optionId]: [...current, valueId],
          };
        }
      } else {
        newOptions = {
          ...prev,
          [optionId]: [valueId],
        };
      }

      // Clear validation errors for this option when user makes a selection
      setValidationErrors((prevErrors) => {
        const newErrors = new Set(prevErrors);
        newErrors.delete(optionId);
        return newErrors;
      });

      return newOptions;
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
    // Validate required options
    const errors = new Set<string>();
    const requiredOptions = product.options.filter(
      (option) => option.isRequired
    );

    requiredOptions.forEach((option) => {
      if (
        !selectedOptions[option.id] ||
        selectedOptions[option.id].length === 0
      ) {
        errors.add(option.id);
      }
    });

    if (errors.size > 0) {
      setValidationErrors(errors);
      return;
    }

    // Set the merchant ID in the cart store
    setLocation(merchantId, merchantSlug, "");

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
      canShip: product.canShip,
      options: cartOptions,
    });

    onClose();
  };

  const canAddToCart = () => {
    const requiredOptions = product.options.filter(
      (option) => option.isRequired
    );
    return requiredOptions.every(
      (option) => selectedOptions[option.id]?.length > 0
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden z-50 border-0">
          <div className="flex flex-col max-h-[95vh]">
            {/* Header with Image */}
            <div className="relative">
              {product.imageUrl ? (
                <div className="relative w-full h-64 bg-gradient-to-b from-gray-100 to-gray-200">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-2xl">
                  <span className="text-gray-400 text-lg">No image</span>
                </div>
              )}

              <Dialog.Close className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-colors shadow-lg">
                <X className="h-5 w-5 text-gray-700" />
              </Dialog.Close>

              {/* Popular badge if needed */}
              <div className="absolute top-4 left-4">
                <span className="bg-[hsl(var(--brand-secondary))] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Popular
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Product Info */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h2>
                  <div className="text-2xl font-bold text-[hsl(var(--brand-secondary))] mb-3">
                    €{product.price.toFixed(2)}
                  </div>
                  {product.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-6">
                  {product.options.map((option) => {
                    const hasError = validationErrors.has(option.id);
                    return (
                      <div key={option.id} className="space-y-3">
                        {/* Option Header */}
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {option.name}
                            {option.isRequired && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </h3>
                          {option.description && (
                            <div className="group relative">
                              <Info className="h-4 w-4 text-gray-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                {option.description}
                              </div>
                            </div>
                          )}
                        </div>

                        {option.type === "MULTISELECT" && (
                          <p className="text-sm text-gray-500">
                            Choose up to {option.optionValues.length} additional
                            items
                          </p>
                        )}

                        {hasError && (
                          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>
                              Please select {option.name.toLowerCase()}
                            </span>
                          </div>
                        )}

                        {/* Options List */}
                        <div className="space-y-2">
                          {option.type === "RADIO" ? (
                            <RadioGroup
                              value={selectedOptions[option.id]?.[0] || ""}
                              onValueChange={(value: string) =>
                                handleOptionChange(option.id, value, false)
                              }
                            >
                              {option.optionValues.map((value) => (
                                <div
                                  key={value.id}
                                  className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-[hsl(var(--brand-primary))] transition-all cursor-pointer group"
                                  onClick={() =>
                                    handleOptionChange(
                                      option.id,
                                      value.id,
                                      false
                                    )
                                  }
                                >
                                  <RadioGroupItem
                                    value={value.id}
                                    className="mt-0.5 pointer-events-none"
                                  />
                                  <div className="flex-1 flex justify-between items-center cursor-pointer">
                                    <span className="font-medium text-gray-900 group-hover:text-[hsl(var(--brand-primary))]">
                                      {value.name}
                                    </span>
                                    {value.priceModifier !== 0 && (
                                      <span
                                        className={`font-semibold ${
                                          value.priceModifier > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {value.priceModifier > 0 ? "+" : ""}€
                                        {Math.abs(value.priceModifier).toFixed(
                                          2
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            <div className="space-y-2">
                              {option.optionValues.map((value) => (
                                <div
                                  key={value.id}
                                  className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-[hsl(var(--brand-primary))] transition-all cursor-pointer group"
                                  onClick={() =>
                                    handleOptionChange(
                                      option.id,
                                      value.id,
                                      true
                                    )
                                  }
                                >
                                  <Checkbox
                                    checked={
                                      selectedOptions[option.id]?.includes(
                                        value.id
                                      ) || false
                                    }
                                    onCheckedChange={() =>
                                      handleOptionChange(
                                        option.id,
                                        value.id,
                                        true
                                      )
                                    }
                                    className="mt-0.5 pointer-events-none"
                                  />
                                  <div className="flex-1 flex justify-between items-center cursor-pointer">
                                    <span className="font-medium text-gray-900 group-hover:text-[hsl(var(--brand-primary))]">
                                      {value.name}
                                    </span>
                                    {value.priceModifier !== 0 && (
                                      <span
                                        className={`font-semibold ${
                                          value.priceModifier > 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {value.priceModifier > 0 ? "+" : ""}€
                                        {Math.abs(value.priceModifier).toFixed(
                                          2
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 h-auto hover:bg-gray-100 rounded-l-lg"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 h-auto hover:bg-gray-100 rounded-r-lg"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Add to Cart Button - Hidden on admin pages */}
                {!isAdminPage && (
                  <Button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart()}
                    variant="secondary"
                    size="lg"
                    className="flex-1 min-w-0 text-lg font-bold py-3"
                  >
                    Add to order - €{calculateTotalPrice().toFixed(2)}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
