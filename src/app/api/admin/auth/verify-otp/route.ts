import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAdminSession, isLocalEnvironment } from "@/lib/auth/utils";
import { cookies } from "next/headers";

// Store temporary OTPs in memory (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if admin user exists
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
      include: {
        location: {
          include: {
            merchant: true,
          },
        },
      },
    });

    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json(
        { error: "Admin user not found or inactive" },
        { status: 404 }
      );
    }

    // In local environment, skip OTP verification
    if (!isLocalEnvironment()) {
      if (!otp) {
        return NextResponse.json({ error: "OTP is required" }, { status: 400 });
      }

      // Verify OTP
      const storedOtpData = otpStore.get(email);
      if (!storedOtpData) {
        return NextResponse.json(
          { error: "OTP not found or expired" },
          { status: 400 }
        );
      }

      if (storedOtpData.expiresAt < new Date()) {
        otpStore.delete(email);
        return NextResponse.json({ error: "OTP expired" }, { status: 400 });
      }

      if (storedOtpData.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      // Clean up used OTP
      otpStore.delete(email);
    }

    // Create session
    const sessionToken = await createAdminSession(adminUser.id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 1 day
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        location: {
          id: adminUser.location.id,
          name: adminUser.location.name,
          merchant: {
            name: adminUser.location.merchant.name,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error verifying login:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
