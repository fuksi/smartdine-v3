"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Checkbox from "@radix-ui/react-checkbox";
import { X, Plus, Minus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [validationErrors, setValidationErrors] = useState<Set<string>>(
    new Set()
  );
  const { addItem, setLocation } = useCartStore();

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
  };

  const canAddToCart = () => {
    const requiredOptions = product.options.filter(
      (option) => option.isRequired
    );
    return requiredOptions.every(
      (option) => selectedOptions[option.id]?.length > 0
    );
  };

  const getOptionValidationMessage = (optionId: string) => {
    if (validationErrors.has(optionId)) {
      const option = product.options.find((o) => o.id === optionId);
      return `Please select ${option?.name?.toLowerCase() || "an option"}`;
    }
    return null;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-0 rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-hidden z-50 border">
          <div className="flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-xl font-semibold pr-8">
                {product.name}
              </Dialog.Title>
              <Dialog.Close className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {product.imageUrl && (
                  <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div>
                  {product.description && (
                    <Dialog.Description className="text-muted-foreground mb-3">
                      {product.description}
                    </Dialog.Description>
                  )}
                  <div className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </div>
                </div>

                {product.options.map((option) => {
                  const hasError = validationErrors.has(option.id);
                  return (
                    <div key={option.id} className="space-y-2">
                      <div className="font-medium">
                        {option.name}
                        {option.isRequired && (
                          <span className="text-red-500"> *</span>
                        )}
                      </div>

                      {hasError && (
                        <div className="flex items-center gap-1 text-sm text-red-500 mb-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>Please select {option.name.toLowerCase()}</span>
                        </div>
                      )}

                      {option.type === "RADIO" ? (
                        <RadioGroup.Root
                          value={selectedOptions[option.id]?.[0] || ""}
                          onValueChange={(value) =>
                            handleOptionChange(option.id, value, false)
                          }
                          className={
                            hasError ? "ring-2 ring-red-200 rounded-md p-2" : ""
                          }
                        >
                          {option.optionValues.map((value) => (
                            <div
                              key={value.id}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroup.Item
                                value={value.id}
                                className="w-4 h-4 rounded-full border border-input bg-background data-[state=checked]:border-primary"
                              >
                                <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-primary" />
                              </RadioGroup.Item>
                              <label className="text-sm flex-1 flex justify-between cursor-pointer">
                                <span>{value.name}</span>
                                {value.priceModifier !== 0 && (
                                  <span
                                    className={
                                      value.priceModifier > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {value.priceModifier > 0 ? "+" : ""}$
                                    {Math.abs(value.priceModifier).toFixed(2)}
                                  </span>
                                )}
                              </label>
                            </div>
                          ))}
                        </RadioGroup.Root>
                      ) : (
                        <div
                          className={`space-y-2 ${
                            hasError ? "ring-2 ring-red-200 rounded-md p-2" : ""
                          }`}
                        >
                          {option.optionValues.map((value) => (
                            <div
                              key={value.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox.Root
                                checked={
                                  selectedOptions[option.id]?.includes(
                                    value.id
                                  ) || false
                                }
                                onCheckedChange={() =>
                                  handleOptionChange(option.id, value.id, true)
                                }
                                className="w-4 h-4 rounded border border-input bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              >
                                <Checkbox.Indicator className="flex items-center justify-center text-primary-foreground">
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
                              <label className="text-sm flex-1 flex justify-between cursor-pointer">
                                <span>{value.name}</span>
                                {value.priceModifier !== 0 && (
                                  <span
                                    className={
                                      value.priceModifier > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {value.priceModifier > 0 ? "+" : ""}$
                                    {Math.abs(value.priceModifier).toFixed(2)}
                                  </span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              {/* Price breakdown display */}
              {Object.keys(selectedOptions).length > 0 && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Base price:</span>
                    <span>${product.price.toFixed(2)}</span>
                  </div>
                  {Object.entries(selectedOptions).map(
                    ([optionId, valueIds]) => {
                      const option = product.options.find(
                        (o) => o.id === optionId
                      );
                      return valueIds.map((valueId) => {
                        const value = option?.optionValues.find(
                          (v) => v.id === valueId
                        );
                        if (!value || value.priceModifier === 0) return null;
                        return (
                          <div
                            key={`${optionId}-${valueId}`}
                            className="flex justify-between"
                          >
                            <span>+ {value.name}:</span>
                            <span
                              className={
                                value.priceModifier > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {value.priceModifier > 0 ? "+" : ""}$
                              {value.priceModifier.toFixed(2)}
                            </span>
                          </div>
                        );
                      });
                    }
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Subtotal (x1):</span>
                    <span>
                      ${(calculateTotalPrice() / quantity).toFixed(2)}
                    </span>
                  </div>
                  {quantity > 1 && (
                    <div className="flex justify-between font-medium">
                      <span>Quantity:</span>
                      <span>x{quantity}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total:</span>
                    <span>${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {quantity}
                  </span>
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
                  disabled={!canAddToCart()}
                  className="flex-1 ml-4"
                  size="lg"
                >
                  Add to Cart - ${calculateTotalPrice().toFixed(2)}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
