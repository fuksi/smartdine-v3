import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminAuth } from "@/lib/superadmin-auth";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> }
) {
  try {
    await requireSuperAdminAuth(request);
    const { locationId } = await params;

    const { stripeConnectAccountId, stripeConnectEnabled } =
      await request.json();

    // Validate location exists
    const location = await prisma.merchantLocation.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Update Stripe Connect details
    const updatedLocation = await prisma.merchantLocation.update({
      where: { id: locationId },
      data: {
        stripeConnectAccountId:
          stripeConnectAccountId && stripeConnectAccountId.trim()
            ? stripeConnectAccountId.trim()
            : null,
        stripeConnectEnabled: !!stripeConnectEnabled,
        stripeConnectSetupAt:
          stripeConnectAccountId && stripeConnectEnabled
            ? new Date()
            : location.stripeConnectSetupAt,
      },
      include: {
        merchant: true,
      },
    });

    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error("Update Stripe Connect error:", error);
    return NextResponse.json(
      { error: "Unauthorized or server error" },
      { status: 401 }
    );
  }
}
