"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, Trash2, ArrowLeft, Truck, MapPin } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { validateShippingAddress } from "@/lib/shipping";

export default function CartPage() {
  const {
    items,
    customerInfo,
    locationId,
    merchantSlug,
    locationSlug,
    fulfilmentType,
    shippingAddress,
    updateQuantity,
    removeItem,
    clearCart,
    setCustomerInfo,
    setFulfilmentType,
    setShippingAddress,
    canAllItemsBeShipped,
    getTotalPrice,
    getTotalItems,
    getShippingCost,
    getTotalWithShipping,
  } = useCartStore();

  const [formData, setFormData] = useState({
    name:
      customerInfo?.name || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_DEV_CHECKOUT_NAME || ""
        : "",
    phone:
      customerInfo?.phone || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_DEV_CHECKOUT_PHONE || ""
        : "",
    email:
      customerInfo?.email || process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_DEV_CHECKOUT_EMAIL || ""
        : "",
  });

  const [shippingFormData, setShippingFormData] = useState({
    street: shippingAddress?.street || "",
    postalCode: shippingAddress?.postalCode || "",
    city: shippingAddress?.city || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(
    // Initialize as valid if there's already a phone number (development)
    formData.phone.trim().length > 0
  );

  // Email validation helper function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Phone change handler
  const handlePhoneChange = (phoneNumber: string, isValid: boolean) => {
    setFormData((prev) => ({ ...prev, phone: phoneNumber }));
    setIsPhoneValid(isValid);
  };

  const handleSubmitOrder = async () => {
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim()
    ) {
      alert("Please fill in your name, phone number, and email address");
      return;
    }

    if (!isValidEmail(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!isPhoneValid) {
      alert("Please enter a valid phone number");
      return;
    }

    // Validate shipping address if shipping is selected
    if (fulfilmentType === "SHIPPING") {
      const shippingValidation = validateShippingAddress({
        street: shippingFormData.street,
        postalCode: shippingFormData.postalCode,
        city: shippingFormData.city,
      });

      if (!shippingValidation.isValid) {
        alert(
          `Please fix the following shipping address errors:\n${shippingValidation.errors.join(
            "\n"
          )}`
        );
        return;
      }
    }

    if (!locationId) {
      alert("No location selected. Please go back and select a restaurant.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save customer info and shipping address
      setCustomerInfo({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });

      if (fulfilmentType === "SHIPPING") {
        setShippingAddress({
          street: shippingFormData.street.trim(),
          postalCode: shippingFormData.postalCode.trim(),
          city: shippingFormData.city.trim(),
        });
      }

      // Calculate totals
      const shippingCost = getShippingCost();
      const totalWithShipping = getTotalWithShipping();

      // Prepare order data
      const orderData = {
        locationId,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email.trim() || null,
        totalAmount: totalWithShipping,
        fulfilmentType: fulfilmentType,
        deliveryAddress:
          fulfilmentType === "SHIPPING" ? shippingFormData.street.trim() : null,
        deliveryPostalCode:
          fulfilmentType === "SHIPPING"
            ? shippingFormData.postalCode.trim()
            : null,
        deliveryCity:
          fulfilmentType === "SHIPPING" ? shippingFormData.city.trim() : null,
        shippingCost: fulfilmentType === "SHIPPING" ? shippingCost : null,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice:
            (item.price +
              item.options.reduce((sum, opt) => sum + opt.priceModifier, 0)) *
            item.quantity,
          options: item.options.map((option) => ({
            optionId: option.optionId,
            optionValueId: option.valueId,
          })),
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const result = await response.json();

      // Now redirect to Stripe Checkout
      const checkoutResponse = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: result.order.id,
          successUrl: `${window.location.origin}/your-order?id=${result.order.id}`,
          cancelUrl: `${window.location.origin}/cart`,
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url, error } = await checkoutResponse.json();

      if (error) {
        throw new Error(error);
      }

      // Clear cart and redirect to Stripe Checkout
      clearCart();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
          <p className="text-muted-foreground mb-6">
            Your cart is empty. Add some items to get started!
          </p>
          <Button asChild>
            <Link href="/">Browse Restaurants</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Create the back to menu link
  const backToMenuHref =
    merchantSlug && locationSlug
      ? `/restaurant/${merchantSlug}/${locationSlug}`
      : "/";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to menu button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
          className="text-[hsl(var(--brand-primary))] hover:text-[hsl(var(--brand-primary-hover))]"
        >
          <Link href={backToMenuHref} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to menu
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        Your Cart ({getTotalItems()} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="bg-white shadow-md border-0 rounded-lg"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} each
                    </p>

                    {item.options.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Options:
                        </p>
                        {item.options.map((option, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-muted-foreground"
                          >
                            {option.optionName}: {option.valueName}
                            {option.priceModifier > 0 && (
                              <span>
                                {" "}
                                (+${option.priceModifier.toFixed(2)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      $
                      {(
                        (item.price +
                          item.options.reduce(
                            (sum, opt) => sum + opt.priceModifier,
                            0
                          )) *
                        item.quantity
                      ).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-white shadow-md border-0 rounded-lg">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Fulfillment Type Selector - only show if all items can be shipped */}
              {canAllItemsBeShipped() && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Delivery Option</h3>
                  <RadioGroup
                    value={fulfilmentType}
                    onValueChange={(value: "PICKUP" | "SHIPPING") =>
                      setFulfilmentType(value)
                    }
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="PICKUP" id="pickup" />
                      <label
                        htmlFor="pickup"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <MapPin className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Click & Collect</div>
                          <div className="text-sm text-gray-500">
                            Pick up at restaurant
                          </div>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="SHIPPING" id="shipping" />
                      <label
                        htmlFor="shipping"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Truck className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Delivery</div>
                          <div className="text-sm text-gray-500">
                            €7.00 (Free over €50)
                          </div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Price Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>€{getTotalPrice().toFixed(2)}</span>
                </div>
                {fulfilmentType === "SHIPPING" && (
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>
                      {getShippingCost() === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `€${getShippingCost().toFixed(2)}`
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>€{getTotalWithShipping().toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">Customer Information</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone *
                  </label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    defaultCountry="FI"
                    placeholder="Phone number"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="your@email.com"
                    required
                  />
                </div>

                {/* Shipping Address - only show if shipping is selected */}
                {fulfilmentType === "SHIPPING" && (
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold">Delivery Address</h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Street Address *
                      </label>
                      <Input
                        type="text"
                        value={shippingFormData.street}
                        onChange={(e) =>
                          setShippingFormData((prev) => ({
                            ...prev,
                            street: e.target.value,
                          }))
                        }
                        placeholder="Street name and number"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Postal Code *
                        </label>
                        <Input
                          type="text"
                          value={shippingFormData.postalCode}
                          onChange={(e) =>
                            setShippingFormData((prev) => ({
                              ...prev,
                              postalCode: e.target.value,
                            }))
                          }
                          placeholder="00000"
                          maxLength={5}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          City *
                        </label>
                        <Input
                          type="text"
                          value={shippingFormData.city}
                          onChange={(e) =>
                            setShippingFormData((prev) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          placeholder="City"
                          required
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Currently only delivering within Finland
                    </p>
                  </div>
                )}

                <Button
                  variant="brand"
                  className="w-full"
                  onClick={handleSubmitOrder}
                  disabled={
                    isSubmitting ||
                    getTotalItems() === 0 ||
                    !formData.name.trim() ||
                    !formData.phone.trim() ||
                    !formData.email.trim() ||
                    !isValidEmail(formData.email) ||
                    !isPhoneValid ||
                    (fulfilmentType === "SHIPPING" &&
                      (!shippingFormData.street.trim() ||
                        !shippingFormData.postalCode.trim() ||
                        !shippingFormData.city.trim() ||
                        !validateShippingAddress({
                          street: shippingFormData.street,
                          postalCode: shippingFormData.postalCode,
                          city: shippingFormData.city,
                        }).isValid))
                  }
                >
                  {isSubmitting
                    ? "Processing..."
                    : `Continue to Payment - €${getTotalWithShipping().toFixed(
                        2
                      )}`}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
