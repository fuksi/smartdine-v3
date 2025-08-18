import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOrderStatusEmail } from "@/lib/email";
import { sendOrderStatusSMS } from "@/lib/sms";
import {
  formatOrderForEmail,
  shouldSendEmailForStatus,
} from "@/lib/order-email-utils";
import {
  formatOrderForSMS,
  shouldSendSMSForStatus,
} from "@/lib/order-sms-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = [
      "PLACED",
      "ACCEPTED",
      "REJECTED",
      "PROCESSING",
      "READY_FOR_PICKUP",
      "FULFILLED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
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

    // Send email notification for specific status changes
    if (updatedOrder.customerEmail && shouldSendEmailForStatus(status)) {
      try {
        const emailData = formatOrderForEmail(updatedOrder);
        await sendOrderStatusEmail(emailData);
        console.log(
          `✅ Email sent for order ${updatedOrder.displayId} status: ${status}`
        );
      } catch (emailError) {
        console.error("❌ Failed to send email notification:", emailError);
        // Don't fail the order update if email fails
      }
    }

    // Send SMS notification for specific status changes (Finnish numbers only)
    if (updatedOrder.customerPhone && shouldSendSMSForStatus(status)) {
      try {
        const smsData = formatOrderForSMS(updatedOrder);
        await sendOrderStatusSMS(smsData);
        console.log(
          `📱 SMS sent for order ${updatedOrder.displayId} status: ${status}`
        );
      } catch (smsError) {
        console.error("❌ Failed to send SMS notification:", smsError);
        // Don't fail the order update if SMS fails
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
