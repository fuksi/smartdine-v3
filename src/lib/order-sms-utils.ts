import { OrderSMSData } from "@/lib/sms";
import { Decimal } from "@prisma/client/runtime/library";

// Type definitions for the order data from Prisma
interface OrderItem {
  product: { name: string };
  quantity: number;
  unitPrice: number | string | Decimal;
  options: Array<{
    option: { name: string };
    optionValue: { name: string };
  }>;
}

interface PrismaOrder {
  id: string;
  displayId: number;
  customerName: string;
  customerPhone: string;
  totalAmount: number | string | Decimal;
  status: string;
  estimatedPickupTime?: Date | null;
  items: OrderItem[];
  location: {
    name: string;
    address: string;
    merchant: {
      name: string;
    };
  };
}

/**
 * Converts a Prisma order object to SMS data format
 */
export function formatOrderForSMS(order: PrismaOrder): OrderSMSData {
  // Ensure we have a valid phone number
  if (!order.customerPhone) {
    throw new Error("Customer phone is required for SMS notifications");
  }

  return {
    orderId: order.id,
    displayId: order.displayId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    merchantName: order.location.merchant.name,
    locationName: order.location.name,
    locationAddress: order.location.address,
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: Number(item.unitPrice),
      options:
        item.options?.map((opt) => ({
          optionName: opt.option.name,
          valueName: opt.optionValue.name,
        })) || [],
    })),
    totalAmount: Number(order.totalAmount),
    status: order.status,
    estimatedPickupTime: order.estimatedPickupTime?.toLocaleString("fi-FI", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/**
 * Determines if an SMS should be sent for a status change
 */
export function shouldSendSMSForStatus(status: string): boolean {
  return ["ACCEPTED", "READY_FOR_PICKUP", "REJECTED"].includes(status);
}
