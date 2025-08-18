import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminAuth } from "@/lib/superadmin-auth";
import { prisma } from "@/lib/db";
import {
  createConnectAccount,
  createConnectAccountLink,
} from "@/lib/stripe/utils";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdminAuth(request);

    const locations = await prisma.merchantLocation.findMany({
      include: {
        merchant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Get locations error:", error);
    return NextResponse.json(
      { error: "Unauthorized or server error" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdminAuth(request);

    const { locationId, email, businessName } = await request.json();

    if (!locationId || !email || !businessName) {
      return NextResponse.json(
        { error: "Location ID, email, and business name are required" },
        { status: 400 }
      );
    }

    // Check if location exists
    const location = await prisma.merchantLocation.findUnique({
      where: { id: locationId },
      include: { merchant: true },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Check if already has Stripe Connect account
    if (location.stripeConnectAccountId) {
      return NextResponse.json(
        { error: "Location already has a Stripe Connect account" },
        { status: 400 }
      );
    }

    // Create Stripe Connect account
    const account = await createConnectAccount(locationId, email, businessName);

    // Create account link for onboarding
    const accountLink = await createConnectAccountLink(
      account.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/superadmin/stripe/return?account_id=${account.id}`,
      `${process.env.NEXT_PUBLIC_APP_URL}/superadmin/stripe/refresh?account_id=${account.id}`
    );

    return NextResponse.json({
      account,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error("Create Stripe Connect account error:", error);
    return NextResponse.json(
      { error: "Failed to create Stripe Connect account" },
      { status: 500 }
    );
  }
}
