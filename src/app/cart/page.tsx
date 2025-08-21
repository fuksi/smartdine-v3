"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Truck,
  MapPin,
  CreditCard,
  Banknote,
} from "lucide-react";
import { formatEuro, formatEuroModifier } from "@/lib/currency";
import {
  useCartStore,
  getCurrentItems,
  getCurrentFulfilmentType,
  getCurrentCustomerInfo,
  getCurrentShippingAddress,
} from "@/lib/store/cart";
import { validateShippingAddress } from "@/lib/shipping";
import { SMSConfirmationModal } from "@/components/sms-confirmation-modal";

export default function CartPage() {
  const store = useCartStore();
  const {
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
    merchantSlug,
  } = store;

  // Get current cart data using selectors
  const items = getCurrentItems(store);
  const customerInfo = getCurrentCustomerInfo(store);
  const fulfilmentType = getCurrentFulfilmentType(store);
  const shippingAddress = getCurrentShippingAddress(store);
  const merchantId = store.currentMerchantId;

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "payAtShop">(
    "card"
  );
  const [showSMSModal, setShowSMSModal] = useState(false);

  // Check if this is Bonbon Coffee
  const isBonbonCoffee = merchantSlug === "bonbon-coffee";

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

  // Pay at shop payment handler
  const handlePayAtShopOrder = async (customerPhone: string) => {
    if (!merchantId) {
      alert("No merchant selected. Please go back and select a restaurant.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate totals
      const shippingCost = getShippingCost();
      const totalWithShipping = getTotalWithShipping();

      // Prepare pay at shop order data
      const orderData = {
        merchantId,
        customerPhone,
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

      const response = await fetch("/api/orders/cod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to submit pay at shop order"
        );
      }

      const result = await response.json();

      // Redirect to order confirmation page
      window.location.href = `/your-order?id=${result.order.id}`;
    } catch (error) {
      console.error("Error submitting pay at shop order:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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

    if (!merchantId) {
      alert("No merchant selected. Please go back and select a restaurant.");
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
        merchantId,
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

      // Redirect to Stripe Checkout (cart will be cleared after successful payment)
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
  const backToMenuHref = merchantSlug ? `/restaurant/${merchantSlug}` : "/";

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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Checkout Information - Left Side */}
        <div className="lg:w-3/4">
          <Card className="bg-white shadow-md border-0 rounded-lg">
            <CardHeader>
              <CardTitle>Checkout Information</CardTitle>
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
                        Click & Collect
                        <span className="text-sm text-muted-foreground">
                          Pick up at restaurant
                        </span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="SHIPPING" id="shipping" />
                      <label
                        htmlFor="shipping"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Truck className="h-4 w-4" />
                        Delivery
                        <span className="text-sm text-muted-foreground">
                          {formatEuro(getShippingCost())}
                        </span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Customer Information</h3>
                <Input
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    });
                  }}
                  className={
                    !formData.name.trim()
                      ? "border-red-200 bg-red-50 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className={
                    !formData.email.trim() || !formData.email.includes("@")
                      ? "border-red-200 bg-red-50 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                <PhoneInput
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={
                    !isPhoneValid
                      ? "border-red-200 bg-red-50 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {!isPhoneValid && formData.phone && (
                  <p className="text-red-600 text-sm">
                    Please enter a valid phone number
                  </p>
                )}
              </div>

              {/* Shipping Address - only show if shipping is selected */}
              {fulfilmentType === "SHIPPING" && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Shipping Address</h3>
                  <Input
                    placeholder="Street Address"
                    value={shippingFormData.street}
                    onChange={(e) =>
                      setShippingFormData({
                        ...shippingFormData,
                        street: e.target.value,
                      })
                    }
                    className={
                      !shippingFormData.street.trim()
                        ? "border-red-200 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Postal Code"
                      value={shippingFormData.postalCode}
                      onChange={(e) =>
                        setShippingFormData({
                          ...shippingFormData,
                          postalCode: e.target.value,
                        })
                      }
                      className={
                        !shippingFormData.postalCode.trim()
                          ? "border-red-200 bg-red-50 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }
                    />
                    <Input
                      placeholder="City"
                      value={shippingFormData.city}
                      onChange={(e) =>
                        setShippingFormData({
                          ...shippingFormData,
                          city: e.target.value,
                        })
                      }
                      className={
                        !shippingFormData.city.trim()
                          ? "border-red-200 bg-red-50 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }
                    />
                  </div>
                  {fulfilmentType === "SHIPPING" &&
                    shippingFormData.street &&
                    shippingFormData.postalCode &&
                    shippingFormData.city &&
                    !validateShippingAddress({
                      street: shippingFormData.street,
                      postalCode: shippingFormData.postalCode,
                      city: shippingFormData.city,
                    }).isValid && (
                      <p className="text-red-600 text-sm">
                        {
                          validateShippingAddress({
                            street: shippingFormData.street,
                            postalCode: shippingFormData.postalCode,
                            city: shippingFormData.city,
                          }).errors[0]
                        }
                      </p>
                    )}
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="font-semibold">Payment Method</h3>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: "card" | "payAtShop") =>
                    setPaymentMethod(value)
                  }
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="card" id="card" />
                    <label
                      htmlFor="card"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <CreditCard className="h-4 w-4" />
                      Credit Card
                    </label>
                  </div>
                  {isBonbonCoffee && (
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="payAtShop" id="payAtShop" />
                      <label
                        htmlFor="payAtShop"
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <Banknote className="h-4 w-4" />
                        Pay at shop
                      </label>
                    </div>
                  )}
                </RadioGroup>
              </div>

              {/* Submit Button */}
              <div className="space-y-4">
                {/* SMS Confirmation Modal */}
                <SMSConfirmationModal
                  isOpen={showSMSModal}
                  onClose={() => setShowSMSModal(false)}
                  onSuccess={handlePayAtShopOrder}
                  totalAmount={getTotalWithShipping()}
                  customerInfo={{
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                  }}
                />

                <Button
                  className="w-full"
                  onClick={
                    isBonbonCoffee && paymentMethod === "payAtShop"
                      ? () => setShowSMSModal(true)
                      : handleSubmitOrder
                  }
                  disabled={
                    isSubmitting ||
                    !formData.name.trim() ||
                    !formData.email.trim() ||
                    !formData.email.includes("@") ||
                    !formData.phone.trim() ||
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
                    : isBonbonCoffee && paymentMethod === "payAtShop"
                    ? `Confirm order with SMS - ${formatEuro(
                        getTotalWithShipping()
                      )}`
                    : `Continue to Payment - ${formatEuro(
                        getTotalWithShipping()
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

        {/* Cart Summary - Right Side */}
        <div className="lg:w-1/4">
          <Card className="bg-white shadow-md border-0 rounded-lg">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start text-sm"
                  >
                    <div className="flex-1 pr-2">
                      <div className="font-medium">{item.name}</div>
                      {item.options.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {item.options.map((option, idx) => (
                            <div key={idx}>
                              {option.optionName}: {option.valueName}
                              {option.priceModifier > 0 && (
                                <span>
                                  {" "}
                                  ({formatEuroModifier(option.priceModifier)})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {formatEuro(item.price)} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatEuro(
                        (item.price +
                          item.options.reduce(
                            (sum, opt) => sum + opt.priceModifier,
                            0
                          )) *
                          item.quantity
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              {/* Order Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatEuro(getTotalPrice())}</span>
                </div>
                {fulfilmentType === "SHIPPING" && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>{formatEuro(getShippingCost())}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatEuro(getTotalWithShipping())}</span>
                </div>
              </div>

              {/* Quick Item Management */}
              <hr className="my-4" />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Quick Edit</h4>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate flex-1 pr-2">{item.name}</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-xs">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
