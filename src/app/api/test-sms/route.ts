import { NextRequest, NextResponse } from "next/server";
import { sendOrderStatusSMS } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const mockOrderData = {
      orderId: "test-order-123",
      displayId: 42,
      customerName: "Phuc Tran",
      customerPhone: "+358401234567", // Finnish number for testing
      merchantName: "Uuno Pizza",
      locationName: "Uuno Jätkäsaari", 
      locationAddress: "Jätkäsaari, Helsinki, Finland",
      items: [
        {
          name: "Margherita Pizza",
          quantity: 1,
          price: 12.50,
          options: [
            {
              optionName: "Size",
              valueName: "Large"
            }
          ]
        },
        {
          name: "Coca Cola",
          quantity: 2,
          price: 2.50
        }
      ],
      totalAmount: 17.50,
      status: "ACCEPTED",
      estimatedPickupTime: "Mon Dec 25 2024 18:30"
    };

    const body = await request.json();
    const { status = "ACCEPTED", phone } = body;

    // Use provided phone or default Finnish number
    const testData = {
      ...mockOrderData,
      status,
      customerPhone: phone || mockOrderData.customerPhone
    };

    await sendOrderStatusSMS(testData);

    return NextResponse.json({
      success: true,
      message: `SMS sent successfully for status: ${status}`,
      phone: testData.customerPhone
    });
  } catch (error) {
    console.error("❌ SMS test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
