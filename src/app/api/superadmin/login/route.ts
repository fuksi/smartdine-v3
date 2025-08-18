import { NextRequest, NextResponse } from "next/server";
import { createOTP, sendOTPEmail } from "@/lib/superadmin-auth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const code = await createOTP(email);
    await sendOTPEmail(email, code);

    return NextResponse.json({
      message: "OTP sent successfully",
      // In development, include the code for testing
      ...(process.env.NODE_ENV === "development" && { code }),
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized email address") {
        return NextResponse.json(
          { error: "Unauthorized email address" },
          { status: 403 }
        );
      }

      if (error.message === "Superadmin account is disabled") {
        return NextResponse.json(
          { error: "Account is disabled" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
