import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  generateOTP,
  validateFinnishPhone,
  normalizeFinnishPhone,
  findCustomerByPhone,
} from "@/lib/auth/customer-auth";
import { sendOTPSMS } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate Finnish phone number
    if (!validateFinnishPhone(phone)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid Finnish phone number (starting with 04 or 05)",
        },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeFinnishPhone(phone);

    // Check if customer exists
    const existingCustomer = await findCustomerByPhone(normalizedPhone);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Store OTP in database
    await prisma.customerOTP.create({
      data: {
        customerId: existingCustomer?.id,
        phone: normalizedPhone,
        code: otp,
        expiresAt,
      },
    });

    // Send OTP via SMS
    try {
      await sendOTPSMS(normalizedPhone, otp);
    } catch (smsError) {
      console.error("SMS sending failed:", smsError);
      // Don't expose SMS errors to client for security
      return NextResponse.json(
        { error: "Failed to send verification code. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your phone",
      customerExists: !!existingCustomer,
      phone: normalizedPhone,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
