import { NextRequest, NextResponse } from "next/server";
import { capturePayment } from "@/lib/stripe/utils";
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

    // Capture the payment
    const paymentIntent = await capturePayment(order.stripePaymentIntentId);

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "ACCEPTED",
        paymentStatus: "CAPTURED",
        paymentCapturedAmount: order.paymentAmount,
        paymentCapturedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        amountCaptured: paymentIntent.amount_capturable,
      },
    });
  } catch (error) {
    console.error("Payment capture error:", error);
    return NextResponse.json(
      { error: "Failed to capture payment" },
      { status: 500 }
    );
  }
}
