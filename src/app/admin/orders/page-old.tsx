import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export default async function AdminOrdersPage() {
  // For now, we'll show a placeholder since we haven't implemented order creation yet
  const orders = await prisma.order.findMany({
    include: {
      location: {
        include: {
          merchant: true,
        },
      },
      items: {
        include: {
          product: true,
          options: {
            include: {
              option: true,
              optionValue: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-orange-100 text-orange-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
        <p className="text-muted-foreground">
          View and manage all incoming orders
        </p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No orders yet. Orders will appear here once customers start
                placing them.
              </p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8)}
                    </CardTitle>
                    <CardDescription>
                      {order.location.merchant.name} - {order.location.name}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-medium">{order.customerPhone}</span>
                  </div>
                  {order.customerEmail && (
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="font-medium">{order.customerEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Time:</span>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <div>
                          <span className="font-medium">
                            {item.product.name}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            x{item.quantity}
                          </span>
                          {item.options.length > 0 && (
                            <div className="text-sm text-muted-foreground ml-4">
                              {item.options.map((opt, idx) => (
                                <span key={idx}>
                                  {opt.option.name}: {opt.optionValue.name}
                                  {idx < item.options.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span>${item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
