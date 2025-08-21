import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOrderDisplayId } from "@/lib/order-utils";

// Types for the request body
interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  options?: Array<{
    optionId: string;
    optionValueId: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      merchantId,
      customerPhone,
      items,
      totalAmount,
      fulfilmentType = "PICKUP",
      deliveryAddress,
      deliveryPostalCode,
      deliveryCity,
      shippingCost,
    } = body;

    // Validate required fields for pay at shop
    if (!merchantId || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields for pay at shop order" },
        { status: 400 }
      );
    }

    // Verify this is for Bonbon Coffee
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant || merchant.slug !== "bonbon-coffee") {
      return NextResponse.json(
        { error: "Pay at shop is only available for Bonbon Coffee" },
        { status: 400 }
      );
    }

    // Find customer by phone
    const customer = await prisma.customer.findUnique({
      where: { phone: customerPhone },
    });

    if (!customer) {
      return NextResponse.json(
        {
          error:
            "Customer not found. Please complete phone verification first.",
        },
        { status: 400 }
      );
    }

    // Generate display ID
    const displayId = await generateOrderDisplayId();

    // Calculate total amount with shipping
    const totalWithShipping =
      parseFloat(totalAmount.toString()) +
      (shippingCost ? parseFloat(shippingCost.toString()) : 0);

    // Create the order with special notes indicating pay at shop
    const order = await prisma.order.create({
      data: {
        displayId,
        merchantId,
        customerId: customer.id,
        customerName:
          `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
          "Customer",
        customerPhone: customer.phone,
        customerEmail: customer.email,
        totalAmount: totalWithShipping,
        status: "PLACED",
        fulfilmentType,
        paymentStatus: "PENDING", // Will be updated to CAPTURED when payment is received
        notes: "PAY_AT_SHOP", // Use notes field to indicate pay at shop
        deliveryAddress: fulfilmentType === "SHIPPING" ? deliveryAddress : null,
        deliveryPostalCode:
          fulfilmentType === "SHIPPING" ? deliveryPostalCode : null,
        deliveryCity: fulfilmentType === "SHIPPING" ? deliveryCity : null,
        shippingCost: shippingCost ? parseFloat(shippingCost.toString()) : 0,
        items: {
          create: items.map((item: OrderItemInput) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
            options: {
              create:
                item.options?.map((option) => ({
                  optionId: option.optionId,
                  optionValueId: option.optionValueId,
                })) || [],
            },
          })),
        },
      },
      include: {
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
        location: {
          include: {
            merchant: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        displayId: order.displayId,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        paymentMethod: "PAY_AT_SHOP", // Return this for client-side display
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating pay at shop order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
