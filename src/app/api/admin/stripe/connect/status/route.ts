import { NextRequest, NextResponse } from "next/server";
import { checkConnectAccountStatus } from "@/lib/stripe/utils";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const locationId = url.searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    // Get the location
    const location = await prisma.merchantLocation.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    if (!location.stripeConnectAccountId) {
      return NextResponse.json({
        isSetup: false,
        isEnabled: false,
        requiresAction: true,
        message: "Stripe Connect not set up",
      });
    }

    // Check account status
    const status = await checkConnectAccountStatus(
      location.stripeConnectAccountId
    );

    return NextResponse.json({
      isSetup: true,
      isEnabled: status.isEnabled,
      requiresAction: status.requiresAction,
      requirements: status.requirements,
      accountId: location.stripeConnectAccountId,
    });
  } catch (error) {
    console.error("Stripe Connect status error:", error);
    return NextResponse.json(
      { error: "Failed to check Stripe Connect status" },
      { status: 500 }
    );
  }
}
