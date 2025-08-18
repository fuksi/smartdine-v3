import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

const AUTHORIZED_EMAIL = "phuc.trandt@outlook.com";

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and save an OTP for the superadmin
 */
export async function createOTP(email: string): Promise<string> {
  if (email !== AUTHORIZED_EMAIL) {
    throw new Error("Unauthorized email address");
  }

  // Find or create superadmin
  let superAdmin = await prisma.superAdmin.findUnique({
    where: { email },
  });

  if (!superAdmin) {
    superAdmin = await prisma.superAdmin.create({
      data: {
        email,
        isActive: true,
      },
    });
  }

  if (!superAdmin.isActive) {
    throw new Error("Superadmin account is disabled");
  }

  // Generate OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Save OTP to database
  await prisma.superAdminOTP.create({
    data: {
      adminId: superAdmin.id,
      code,
      expiresAt,
      isUsed: false,
    },
  });

  return code;
}

/**
 * Verify OTP and create session
 */
export async function verifyOTPAndCreateSession(
  email: string,
  code: string
): Promise<string> {
  if (email !== AUTHORIZED_EMAIL) {
    throw new Error("Unauthorized email address");
  }

  const superAdmin = await prisma.superAdmin.findUnique({
    where: { email },
  });

  if (!superAdmin || !superAdmin.isActive) {
    throw new Error("Superadmin not found or disabled");
  }

  // Find valid OTP
  const otp = await prisma.superAdminOTP.findFirst({
    where: {
      adminId: superAdmin.id,
      code,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otp) {
    throw new Error("Invalid or expired OTP");
  }

  // Mark OTP as used
  await prisma.superAdminOTP.update({
    where: { id: otp.id },
    data: { isUsed: true },
  });

  // Create session
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.superAdminSession.create({
    data: {
      adminId: superAdmin.id,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verify session token
 */
export async function verifySession(token: string) {
  const session = await prisma.superAdminSession.findUnique({
    where: { token },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date() || !session.admin.isActive) {
    return null;
  }

  return session.admin;
}

/**
 * Get session token from request
 */
export function getSessionToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try cookie
  const cookies = request.headers.get("cookie");
  if (cookies) {
    const match = cookies.match(/superadmin_session=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Middleware to require superadmin authentication
 */
export async function requireSuperAdminAuth(request: NextRequest) {
  const token = getSessionToken(request);
  if (!token) {
    throw new Error("No session token provided");
  }

  const admin = await verifySession(token);
  if (!admin) {
    throw new Error("Invalid or expired session");
  }

  return admin;
}

/**
 * Send OTP via email (mock implementation for development)
 */
export async function sendOTPEmail(email: string, code: string): Promise<void> {
  console.log("=== OTP EMAIL ===");
  console.log(`To: ${email}`);
  console.log(`Subject: SmartDine Superadmin Login`);
  console.log(`Your OTP code is: ${code}`);
  console.log(`This code expires in 10 minutes.`);
  console.log("==================");

  // In production, implement actual email sending here
  // For now, just log to console for development
}
