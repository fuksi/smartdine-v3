import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOrderStatusEmail } from "@/lib/email";
import { formatOrderForEmail } from "@/lib/order-email-utils";

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, testEmail } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      );
    }

    // Get order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format order for email
    const emailData = formatOrderForEmail(order);

    // Override email for testing if provided
    if (testEmail) {
      emailData.customerEmail = testEmail;
    }

    // Override status for testing
    emailData.status = status;

    // Send test email
    const result = await sendOrderStatusEmail(emailData);

    return NextResponse.json({
      success: true,
      message: `Test email sent for order ${order.displayId} with status ${status}`,
      emailResult: result,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
