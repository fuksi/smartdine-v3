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
      locationId,
      customerName,
      customerPhone,
      customerEmail,
      items,
      totalAmount,
      fulfilmentType = "PICKUP",
      deliveryAddress,
      deliveryPostalCode,
      deliveryCity,
      shippingCost,
    } = body;

    // Validate required fields
    if (
      !locationId ||
      !customerName ||
      !customerPhone ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique display ID for the order
    const displayId = await generateOrderDisplayId();

    // Create the order
    const order = await prisma.order.create({
      data: {
        locationId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        totalAmount: parseFloat(totalAmount),
        status: "PLACED",
        fulfilmentType: fulfilmentType,
        deliveryAddress: deliveryAddress || null,
        deliveryPostalCode: deliveryPostalCode || null,
        deliveryCity: deliveryCity || null,
        shippingCost: shippingCost ? parseFloat(shippingCost) : null,
        displayId,
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
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
