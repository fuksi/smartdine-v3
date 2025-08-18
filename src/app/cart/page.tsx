"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

export default function CartPage() {
  const {
    items,
    customerInfo,
    locationId,
    merchantSlug,
    locationSlug,
    updateQuantity,
    removeItem,
    clearCart,
    setCustomerInfo,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const [formData, setFormData] = useState({
    name: customerInfo?.name || "",
    phone: customerInfo?.phone || "",
    email: customerInfo?.email || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation helper function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
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

    if (!locationId) {
      alert("No location selected. Please go back and select a restaurant.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save customer info
      setCustomerInfo({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });

      // Prepare order data
      const orderData = {
        locationId,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email.trim() || null,
        totalAmount: getTotalPrice(),
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

      // Redirect to order tracking page
      clearCart();
      window.location.href = `/your-order?id=${result.order.id}`;
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
            <CardContent className="space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>

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
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Your phone number"
                    required
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

                <Button
                  variant="brand"
                  className="w-full"
                  onClick={handleSubmitOrder}
                  disabled={
                    isSubmitting ||
                    !formData.name.trim() ||
                    !formData.phone.trim() ||
                    !formData.email.trim() ||
                    !isValidEmail(formData.email)
                  }
                >
                  {isSubmitting
                    ? "Submitting..."
                    : `Place Order - $${getTotalPrice().toFixed(2)}`}
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
