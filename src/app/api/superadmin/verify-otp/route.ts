import { NextRequest, NextResponse } from "next/server";
import { verifyOTPAndCreateSession } from "@/lib/superadmin-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    const token = await verifyOTPAndCreateSession(email, code);

    const response = NextResponse.json({
      message: "Login successful",
      token,
    });

    // Set session cookie
    response.cookies.set("superadmin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);

    if (error instanceof Error) {
      if (
        error.message === "Unauthorized email address" ||
        error.message === "Superadmin not found or disabled" ||
        error.message === "Invalid or expired OTP"
      ) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
    }

    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
