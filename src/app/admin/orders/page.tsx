"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { formatDisplayId } from "@/lib/order-utils";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Utensils,
  Phone,
  Mail,
  Filter,
  RefreshCw,
  AlertTriangle,
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
}

const statusConfig = {
  PLACED: { label: "New Order", color: "blue", icon: Clock },
  ACCEPTED: { label: "Accepted", color: "green", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "red", icon: XCircle },
  PROCESSING: { label: "Processing", color: "yellow", icon: Utensils },
  READY_FOR_PICKUP: { label: "Ready", color: "green", icon: Package },
  FULFILLED: { label: "Fulfilled", color: "gray", icon: CheckCircle },
};

// Simplified status flow
const getNextAction = (status: OrderStatus) => {
  switch (status) {
    case "PLACED":
      return { accept: "ACCEPTED", reject: "REJECTED" };
    case "ACCEPTED":
      return { ready: "READY_FOR_PICKUP" };
    case "READY_FOR_PICKUP":
      return { fulfilled: "FULFILLED" };
    default:
      return null;
  }
};

const REJECT_REASONS = [
  "Out of stock",
  "Restaurant is busy at the moment",
  "Ingredient unavailable",
  "Equipment issue",
  "Other reason",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [acceptModal, setAcceptModal] = useState<{
    open: boolean;
    orderId: string | null;
  }>({
    open: false,
    orderId: null,
  });
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    orderId: string | null;
  }>({
    open: false,
    orderId: null,
  });
  const [preparationTime, setPreparationTime] = useState("20");
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    estimatedPickupTime?: string
  ) => {
    try {
      const payload: {
        status: OrderStatus;
        estimatedPickupTime?: string;
      } = { status: newStatus };

      if (estimatedPickupTime) {
        payload.estimatedPickupTime = estimatedPickupTime;
      }

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Update the order in the local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  ...(estimatedPickupTime && { estimatedPickupTime }),
                }
              : order
          )
        );
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const handleAcceptOrder = () => {
    if (acceptModal.orderId) {
      const minutes = parseInt(preparationTime);
      const estimatedTime = new Date();
      estimatedTime.setMinutes(estimatedTime.getMinutes() + minutes);

      updateOrderStatus(
        acceptModal.orderId,
        "ACCEPTED",
        estimatedTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      setAcceptModal({ open: false, orderId: null });
      setPreparationTime("20"); // Reset to default
    }
  };

  const handleRejectOrder = () => {
    if (rejectModal.orderId) {
      // For now, just reject without reason - we can add this to schema later
      updateOrderStatus(rejectModal.orderId, "REJECTED");
      setRejectModal({ open: false, orderId: null });
      setRejectReason(REJECT_REASONS[0]); // Reset to default
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesSearch =
      searchTerm === "" ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    const config = statusConfig[status];
    switch (config.color) {
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "green":
        return "bg-green-100 text-green-800";
      case "red":
        return "bg-red-100 text-red-800";
      case "yellow":
        return "bg-yellow-100 text-yellow-800";
      case "gray":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Button onClick={fetchOrders} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="min-w-40"
            >
              <option value="all">All Statuses</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Search by customer name, phone, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No orders found matching your criteria.
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            const nextActions = getNextAction(order.status);

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-5 w-5" />
                        <CardTitle className="text-lg">
                          Order #{formatDisplayId(order.displayId)}
                        </CardTitle>
                        <Badge className={getStatusBadgeColor(order.status)}>
                          {statusConfig[order.status].label}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(order.createdAt)} • €
                        {Number(order.totalAmount).toFixed(2)}
                        {order.estimatedPickupTime && (
                          <span> • Pickup: {order.estimatedPickupTime}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {nextActions?.accept && (
                        <Button
                          size="sm"
                          onClick={() =>
                            setAcceptModal({ open: true, orderId: order.id })
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept Order
                        </Button>
                      )}
                      {nextActions?.reject && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setRejectModal({ open: true, orderId: order.id })
                          }
                        >
                          Reject Order
                        </Button>
                      )}
                      {nextActions?.ready && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateOrderStatus(order.id, "READY_FOR_PICKUP")
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Mark Ready
                        </Button>
                      )}
                      {nextActions?.fulfilled && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateOrderStatus(order.id, "FULFILLED")
                          }
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          Mark Fulfilled
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-semibold mb-2">
                        Customer Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {order.customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {order.customerPhone}
                          </a>
                        </div>
                        {order.customerEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <a
                              href={`mailto:${order.customerEmail}`}
                              className="text-blue-600 hover:underline"
                            >
                              {order.customerEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="text-sm border-l-2 border-gray-200 pl-3"
                          >
                            <div className="flex justify-between">
                              <span>
                                {item.quantity}× {item.product.name}
                              </span>
                              <span>€{Number(item.totalPrice).toFixed(2)}</span>
                            </div>
                            {item.options.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.options.map((option, idx) => (
                                  <div key={idx}>
                                    {option.option.name}:{" "}
                                    {option.optionValue.name}
                                    {Number(option.optionValue.priceModifier) >
                                      0 && (
                                      <span>
                                        {" "}
                                        (+€
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
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Accept Order Modal */}
      <Dialog
        open={acceptModal.open}
        onOpenChange={(open) => setAcceptModal({ open, orderId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Order</DialogTitle>
            <DialogDescription>
              Please specify the estimated preparation time for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label
              htmlFor="prep-time"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Preparation time (minutes)
            </label>
            <Input
              id="prep-time"
              type="number"
              value={preparationTime}
              onChange={(e) => setPreparationTime(e.target.value)}
              min="5"
              max="120"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Customer will be notified of the estimated pickup time.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAcceptModal({ open: false, orderId: null })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAcceptOrder}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Order Modal */}
      <Dialog
        open={rejectModal.open}
        onOpenChange={(open) => setRejectModal({ open, orderId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Reject Order
            </DialogTitle>
            <DialogDescription>
              Please select a reason for rejecting this order. The customer will
              be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label
              htmlFor="reject-reason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Reason for rejection
            </label>
            <Select
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full"
            >
              {REJECT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectModal({ open: false, orderId: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectOrder}>
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
