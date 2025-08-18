import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    // Create the order
    const order = await prisma.order.create({
      data: {
        locationId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        totalAmount: parseFloat(totalAmount),
        status: "PLACED",
        fulfilmentType: "PICKUP",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
            options: {
              create:
                item.options?.map((option: any) => ({
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
