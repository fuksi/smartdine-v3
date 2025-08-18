import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { generateOTP, isLocalEnvironment } from "@/lib/auth/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

// Store temporary OTPs in memory (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if admin user exists
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json(
        { error: "Admin user not found or inactive" },
        { status: 404 }
      );
    }

    // In local environment, skip OTP
    if (isLocalEnvironment()) {
      return NextResponse.json({
        success: true,
        message: "Local environment - OTP not required",
        skipOtp: true,
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    // Store OTP temporarily
    otpStore.set(email, { otp, expiresAt });

    // Send OTP email
    await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: email,
      subject: "Admin Login OTP - SmartDine",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">SmartDine Admin Login</h2>
          <p>Your one-time password (OTP) for admin login is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #2563eb;">${otp}</span>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this login, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error sending login OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
