import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export interface AdminUser {
  id: string;
  email: string;
  locationId: string;
  location: {
    id: string;
    name: string;
    merchant: {
      name: string;
    };
  };
}

// Generate a secure session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Generate OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create admin session
export async function createAdminSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // 1 day expiry

  await prisma.adminSession.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

// Verify admin session
export async function verifyAdminSession(
  token: string
): Promise<AdminUser | null> {
  if (!token) return null;

  try {
    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            location: {
              include: {
                merchant: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.adminSession.delete({ where: { id: session.id } });
      }
      return null;
    }

    if (!session.user.location) {
      console.error("Admin user has no location assigned");
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      locationId: session.user.locationId!,
      location: {
        id: session.user.location.id,
        name: session.user.location.name,
        merchant: {
          name: session.user.location.merchant.name,
        },
      },
    };
  } catch (error) {
    console.error("Error verifying admin session:", error);
    return null;
  }
}

// Get admin user from request
export async function getAdminFromRequest(
  request: NextRequest
): Promise<AdminUser | null> {
  const token = request.cookies.get("admin_token")?.value;
  return verifyAdminSession(token || "");
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.adminSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

// Logout admin (delete session)
export async function logoutAdmin(token: string): Promise<void> {
  await prisma.adminSession.deleteMany({
    where: { token },
  });
}

// Check if running in local environment
export function isLocalEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
  );
}
