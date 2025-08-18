"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDisplayId } from "@/lib/order-utils";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Utensils,
  Coffee,
} from "lucide-react";

type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "REJECTED"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "FULFILLED";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
  };
  options: Array<{
    option: {
      name: string;
    };
    optionValue: {
      name: string;
      priceModifier: number;
    };
  }>;
}

interface Order {
  id: string;
  displayId: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalAmount: number;
  status: OrderStatus;
  fulfilmentType: string;
  estimatedPickupTime?: string;
  createdAt: string;
  items: OrderItem[];
  location: {
    name: string;
    address: string;
    phone?: string;
    merchant: {
      name: string;
    };
  };
}

const statusConfig = {
  PLACED: {
    label: "Order Placed",
    color: "blue",
    icon: Clock,
    description: "Your order has been placed and is waiting for confirmation",
  },
  ACCEPTED: {
    label: "Order Accepted",
    color: "green",
    icon: CheckCircle,
    description: "Your order has been accepted and will be prepared shortly",
  },
  REJECTED: {
    label: "Order Rejected",
    color: "red",
    icon: XCircle,
    description: "Unfortunately, your order could not be accepted",
  },
  PROCESSING: {
    label: "Preparing",
    color: "yellow",
    icon: Utensils,
    description: "Your order is being prepared",
  },
  READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    color: "green",
    icon: Package,
    description: "Your order is ready for pickup!",
  },
  FULFILLED: {
    label: "Completed",
    color: "gray",
    icon: CheckCircle,
    description: "Order completed. Thank you!",
  },
};

export default function YourOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Order not found");
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrder, 30000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading your order...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Order Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <StatusIcon
                className={`h-12 w-12 text-${currentStatus.color}-500`}
              />
            </div>
            <CardTitle className="text-2xl">
              <Badge
                variant="secondary"
                className={`bg-${currentStatus.color}-100 text-${currentStatus.color}-800 text-lg px-4 py-2`}
              >
                {currentStatus.label}
              </Badge>
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {currentStatus.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Order #</span>
                <span className="font-mono text-sm">
                  {formatDisplayId(order.displayId)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Order Time</span>
                <span>{formatTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold">
                  ${Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
              {order.estimatedPickupTime && (
                <div className="flex justify-between">
                  <span className="font-medium">Estimated Pickup</span>
                  <span>{formatTime(order.estimatedPickupTime)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Restaurant Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-semibold">
                {order.location.merchant.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {order.location.name}
              </div>
              <div className="text-sm">{order.location.address}</div>
              {order.location.phone && (
                <div className="text-sm">
                  <span className="font-medium">Phone: </span>
                  <a
                    href={`tel:${order.location.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.location.phone}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start border-b pb-4 last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{item.product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × $
                      {Number(item.unitPrice).toFixed(2)}
                    </div>
                    {item.options.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.options.map((option, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-muted-foreground"
                          >
                            {option.option.name}: {option.optionValue.name}
                            {Number(option.optionValue.priceModifier) > 0 && (
                              <span>
                                {" "}
                                (+$
                                {Number(
                                  option.optionValue.priceModifier
                                ).toFixed(2)}
                                )
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold">
                    <div className="font-semibold">
                      ${Number(item.totalPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Name: </span>
                <span>{order.customerName}</span>
              </div>
              <div>
                <span className="font-medium">Phone: </span>
                <span>{order.customerPhone}</span>
              </div>
              {order.customerEmail && (
                <div>
                  <span className="font-medium">Email: </span>
                  <span>{order.customerEmail}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
