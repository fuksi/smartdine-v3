import { OrderEmailData } from "@/lib/email";
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
  customerEmail: string | null;
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
 * Converts a Prisma order object to email data format
 */
export function formatOrderForEmail(order: PrismaOrder): OrderEmailData {
  // Ensure we have a valid email address
  if (!order.customerEmail) {
    throw new Error("Customer email is required for email notifications");
  }

  return {
    orderId: order.id,
    displayId: order.displayId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
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
    estimatedPickupTime: order.estimatedPickupTime?.toISOString(),
  };
}

/**
 * Determines if an email should be sent for a status change
 */
export function shouldSendEmailForStatus(status: string): boolean {
  return ["ACCEPTED", "REJECTED", "READY_FOR_PICKUP"].includes(status);
}

/**
 * Gets a human-readable status name
 */
export function getStatusDisplayName(status: string): string {
  const statusNames: Record<string, string> = {
    PLACED: "Placed",
    ACCEPTED: "Accepted",
    REJECTED: "Cannot Fulfill",
    PROCESSING: "Being Prepared",
    READY_FOR_PICKUP: "Ready for Pickup",
    FULFILLED: "Completed",
  };

  return statusNames[status] || status;
}
