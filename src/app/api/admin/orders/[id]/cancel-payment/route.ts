import { NextRequest, NextResponse } from "next/server";
import { cancelPayment } from "@/lib/stripe/utils";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.stripePaymentIntentId) {
      return NextResponse.json(
        { error: "No payment intent found for this order" },
        { status: 400 }
      );
    }

    if (order.paymentStatus !== "AUTHORIZED") {
      return NextResponse.json(
        { error: "Payment is not authorized" },
        { status: 400 }
      );
    }

    // Cancel the payment
    const paymentIntent = await cancelPayment(order.stripePaymentIntentId);

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "REJECTED",
        paymentStatus: "CANCELED",
      },
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    console.error("Payment cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel payment" },
      { status: 500 }
    );
  }
}
