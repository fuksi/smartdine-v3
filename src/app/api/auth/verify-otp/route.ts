import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  normalizeFinnishPhone,
  createCustomer,
  createCustomerSession,
} from "@/lib/auth/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, firstName, email } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeFinnishPhone(phone);

    // Find valid OTP
    const otpRecord = await prisma.customerOTP.findFirst({
      where: {
        phone: normalizedPhone,
        code: otp,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        customer: true,
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    await prisma.customerOTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    let customer = otpRecord.customer;

    // If customer doesn't exist, create one
    if (!customer) {
      if (!firstName) {
        return NextResponse.json(
          { error: "First name is required for new customers" },
          { status: 400 }
        );
      }

      customer = await createCustomer(normalizedPhone, firstName, email);
    }

    // Create session
    const sessionToken = await createCustomerSession(customer.id);

    // Clean up old OTPs for this phone
    await prisma.customerOTP.deleteMany({
      where: {
        phone: normalizedPhone,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      customer: {
        id: customer.id,
        phone: customer.phone,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
