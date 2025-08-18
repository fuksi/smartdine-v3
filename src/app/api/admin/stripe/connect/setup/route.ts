import { NextRequest, NextResponse } from "next/server";
import {
  createConnectAccount,
  createConnectAccountLink,
} from "@/lib/stripe/utils";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, returnUrl, refreshUrl } = body;

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    // Get the location
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

    let accountId = location.stripeConnectAccountId;

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await createConnectAccount(
        locationId,
        location.email || "",
        `${location.merchant.name} - ${location.name}`
      );
      accountId = account.id;
    }

    // Create account link for onboarding
    const accountLink = await createConnectAccountLink(
      accountId,
      returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/admin/stripe/return`,
      refreshUrl || `${process.env.NEXT_PUBLIC_APP_URL}/admin/stripe/refresh`
    );

    return NextResponse.json({
      accountId,
      url: accountLink.url,
    });
  } catch (error) {
    console.error("Stripe Connect setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup Stripe Connect" },
      { status: 500 }
    );
  }
}
