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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden z-50 border-0">
          <div className="flex flex-col max-h-[95vh]">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b bg-gray-50/50">
              <div className="flex-1 pr-8">
                <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </Dialog.Title>
                {product.description && (
                  <Dialog.Description className="text-gray-600 leading-relaxed">
                    {product.description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="grid gap-6">
                  {/* Image and Price */}
                  <div className="flex gap-6">
                    {product.imageUrl ? (
                      <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}

                    <div className="flex flex-col justify-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${product.price.toFixed(2)}
                      </div>
                      {Object.keys(selectedOptions).length > 0 && (
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Starting price</div>
                          <div className="text-lg font-semibold text-gray-900">
                            Total: ${calculateTotalPrice().toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  {product.options.map((option) => {
                    const hasError = validationErrors.has(option.id);
                    return (
                      <div key={option.id} className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {option.name}
                              {option.isRequired && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </h3>
                          </div>
                          {option.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {option.description}
                            </p>
                          )}

                          {hasError && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              <span>
                                Please select {option.name.toLowerCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {option.type === "RADIO" ? (
                          <RadioGroup.Root
                            value={selectedOptions[option.id]?.[0] || ""}
                            onValueChange={(value) =>
                              handleOptionChange(option.id, value, false)
                            }
                            className="grid gap-2"
                          >
                            {option.optionValues.map((value) => (
                              <div
                                key={value.id}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
                              >
                                <RadioGroup.Item
                                  value={value.id}
                                  className="w-5 h-5 rounded-full border-2 border-gray-300 data-[state=checked]:border-primary data-[state=checked]:bg-primary flex items-center justify-center"
                                >
                                  <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-white" />
                                </RadioGroup.Item>
                                <label className="flex-1 flex justify-between items-center cursor-pointer">
                                  <span className="font-medium text-gray-900">
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
                                      {value.priceModifier > 0 ? "+" : ""}$
                                      {Math.abs(value.priceModifier).toFixed(2)}
                                    </span>
                                  )}
                                </label>
                              </div>
                            ))}
                          </RadioGroup.Root>
                        ) : (
                          <div className="grid gap-2">
                            {option.optionValues.map((value) => (
                              <div
                                key={value.id}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
                              >
                                <Checkbox.Root
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
                                  className="w-5 h-5 rounded border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center"
                                >
                                  <Checkbox.Indicator className="text-white">
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
                                <label className="flex-1 flex justify-between items-center cursor-pointer">
                                  <span className="font-medium text-gray-900">
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
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50/50 p-6">
              <div className="flex items-center justify-between gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 h-auto"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 h-auto"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart()}
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold"
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
