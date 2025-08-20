import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export interface Customer {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

// Generate a secure session token
export function generateCustomerSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Generate OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate Finnish phone number
export function validateFinnishPhone(phone: string): boolean {
  // Remove spaces, dashes, and plus signs for checking
  const cleanPhone = phone.replace(/[\s\-\+]/g, "");

  // Check if it starts with Finnish country code or is a Finnish mobile number
  // Finnish mobile numbers: +358 4X, +358 5X, or domestic format 04X, 05X
  const finnishPatterns = [
    /^358[45]\d{7,8}$/, // +358 4X or +358 5X format
    /^0[45]\d{7,8}$/, // Domestic 04X or 05X format
  ];

  return finnishPatterns.some((pattern) => pattern.test(cleanPhone));
}

// Normalize Finnish phone number to international format
export function normalizeFinnishPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-\+]/g, "");

  // If starts with 0, replace with 358
  if (cleanPhone.startsWith("0")) {
    return "+358" + cleanPhone.substring(1);
  }

  // If starts with 358, add +
  if (cleanPhone.startsWith("358")) {
    return "+" + cleanPhone;
  }

  return phone;
}

// Create customer session
export async function createCustomerSession(
  customerId: string
): Promise<string> {
  const token = generateCustomerSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  await prisma.customerSession.create({
    data: {
      customerId,
      token,
      expiresAt,
    },
  });

  return token;
}

// Verify customer session
export async function verifyCustomerSession(
  token: string
): Promise<Customer | null> {
  if (!token) return null;

  try {
    const session = await prisma.customerSession.findUnique({
      where: { token },
      include: {
        customer: true,
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        // Clean up expired session
        await prisma.customerSession.delete({
          where: { id: session.id },
        });
      }
      return null;
    }

    return {
      id: session.customer.id,
      phone: session.customer.phone,
      firstName: session.customer.firstName,
      lastName: session.customer.lastName,
      email: session.customer.email,
    };
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

// Get customer from request
export async function getCustomerFromRequest(
  request: NextRequest
): Promise<Customer | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyCustomerSession(token);
}

// Logout customer (invalidate session)
export async function logoutCustomer(token: string): Promise<void> {
  try {
    await prisma.customerSession.delete({
      where: { token },
    });
  } catch (error) {
    // Session might not exist, which is fine
    console.log("Session cleanup error (might be already deleted):", error);
  }
}

// Check if customer exists by phone
export async function findCustomerByPhone(
  phone: string
): Promise<Customer | null> {
  const normalizedPhone = normalizeFinnishPhone(phone);

  try {
    const customer = await prisma.customer.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!customer) return null;

    return {
      id: customer.id,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
    };
  } catch (error) {
    console.error("Find customer error:", error);
    return null;
  }
}

// Create customer
export async function createCustomer(
  phone: string,
  firstName?: string,
  email?: string
) {
  const normalizedPhone = normalizeFinnishPhone(phone);

  const customer = await prisma.customer.create({
    data: {
      phone: normalizedPhone,
      firstName,
      email,
    },
  });

  return customer;
}
